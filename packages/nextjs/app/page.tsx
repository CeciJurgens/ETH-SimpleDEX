"use client";

import { useEffect, useState } from "react";
import { NextPage } from "next";
import { formatUnits, parseEther } from "viem";
import { useAccount } from "wagmi";
import { ArrowDownUp, Zap, PlusCircle, MinusCircle } from "lucide-react";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth/useDeployedContractInfo";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

const Home: NextPage = () => {
  const [amountToSwap, setAmountToSwap] = useState<string>("0");
  const [liquidityAmount, setLiquidityAmount] = useState<string>("0");
  const [isSwappingAtoB, setIsSwappingAtoB] = useState(true);
  const [selectedAction, setSelectedAction] = useState<'swap' | 'addLiquidity' | 'removeLiquidity'>('swap');
  const [estimatedOutput, setEstimatedOutput] = useState<string | undefined>();
  const [isApproved, setIsApproved] = useState(false);
  const account = useAccount();

  const { data: tokenAData } = useDeployedContractInfo("TokenA");
  const { data: tokenBData } = useDeployedContractInfo("TokenB");
  const { data: simpleDEXData } = useDeployedContractInfo("SimpleDEX");

  const tokenAAddress = tokenAData?.address;
  const tokenBAddress = tokenBData?.address;
  const simpleDEXAddress = simpleDEXData?.address;


  // Consultas para obtener los balances de los tokens y liquidez
  const { data: reserveA } = useScaffoldReadContract({
    contractName: "TokenA",
    functionName: "balanceOf",
    args: [simpleDEXAddress],
  });

  const { data: reserveB } = useScaffoldReadContract({
    contractName: "TokenB",
    functionName: "balanceOf",
    args: [simpleDEXAddress],
  });

  const { data: priceA } = useScaffoldReadContract({
    contractName: "SimpleDEX",
    functionName: "getPrice",
    args: [tokenAAddress],
  });

  const { data: priceB } = useScaffoldReadContract({
    contractName: "SimpleDEX",
    functionName: "getPrice",
    args: [tokenBAddress],
  });

  // Funciones de contrato
  const { writeContractAsync: approveTokenA } = useScaffoldWriteContract("TokenA");
  const { writeContractAsync: approveTokenB } = useScaffoldWriteContract("TokenB");
  const { writeContractAsync: swapAforB } = useScaffoldWriteContract("SimpleDEX");
  const { writeContractAsync: swapBforA } = useScaffoldWriteContract("SimpleDEX");
  const { writeContractAsync: addLiquidity } = useScaffoldWriteContract("SimpleDEX");
  const { writeContractAsync: removeLiquidity } = useScaffoldWriteContract("SimpleDEX");

  // Estimación de salida para swap
  useEffect(() => {
    if (selectedAction === 'swap' && amountToSwap && reserveA && reserveB && priceA && priceB) {
      const inputAmountInWei = parseEther(amountToSwap);
      const reserveIn = isSwappingAtoB ? BigInt(reserveA) : BigInt(reserveB);
      const reserveOut = isSwappingAtoB ? BigInt(reserveB) : BigInt(reserveA);

      const estimated = (inputAmountInWei * reserveOut) / (reserveIn + inputAmountInWei);
      const estimatedFormatted = formatUnits(estimated, 18);

      setEstimatedOutput(parseFloat(estimatedFormatted).toFixed(3));
    }
  }, [amountToSwap, isSwappingAtoB, reserveA, reserveB, priceA, priceB, selectedAction]);

  // Manejar la aprobación para swap
  const handleApprove = async () => {
    try {
      if (selectedAction === 'swap') {
        if (isSwappingAtoB) {
          await approveTokenA({
            functionName: "approve",
            args: [simpleDEXAddress, BigInt(parseEther(amountToSwap))],
          });
        } else {
          await approveTokenB({
            functionName: "approve",
            args: [simpleDEXAddress, BigInt(parseEther(amountToSwap))],
          });
        }
      } else if (selectedAction === 'addLiquidity') {
        // Aprobar ambos tokens para agregar liquidez
        await approveTokenA({
          functionName: "approve",
          args: [simpleDEXAddress, BigInt(parseEther(liquidityAmount))],
        });
        await approveTokenB({
          functionName: "approve",
          args: [simpleDEXAddress, BigInt(parseEther(liquidityAmount))],
        });
      }
      setIsApproved(true);
      alert("Approval successful!");
    } catch (e) {
      console.error("Error approving tokens:", e);
      alert("There was an error approving the tokens.");
    }
  };

  // Manejar intercambio de tokens
  const handleSwap = async () => {
    if (!isApproved) {
      alert("You must approve the token first.");
      return;
    }

    try {
      if (selectedAction === 'swap') {
        if (isSwappingAtoB) {
          await swapAforB({
            functionName: "swapAforB",
            args: [BigInt(parseEther(amountToSwap))],
          });
        } else {
          await swapBforA({
            functionName: "swapBforA",
            args: [BigInt(parseEther(amountToSwap))],
          });
        }
        alert("Swap successful!");
      } else if (selectedAction === 'addLiquidity') {
        await addLiquidity({
          functionName: "addLiquidity",
          args: [BigInt(parseEther(liquidityAmount)), BigInt(parseEther(liquidityAmount))],
        });
        alert("Liquidity added successfully!");
      } else if (selectedAction === 'removeLiquidity') {
        await removeLiquidity({
          functionName: "removeLiquidity",
          args: [BigInt(parseEther(liquidityAmount))],
        });
        alert("Liquidity removed successfully!");
      }

      // Resetear estados
      setAmountToSwap("0");
      setLiquidityAmount("0");
      setIsApproved(false);
    } catch (e) {
      console.error("Error during transaction:", e);
      alert("There was an error during the transaction.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h1 className="text-3xl font-bold text-white text-center">SimpleDEX Exchange</h1>
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 p-4 bg-gray-50 border-b">
          <button 
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              selectedAction === 'swap' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setSelectedAction('swap')}
          >
            <ArrowDownUp size={20} />
            <span>Swap</span>
          </button>
          <button 
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              selectedAction === 'addLiquidity' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setSelectedAction('addLiquidity')}
          >
            <PlusCircle size={20} />
            <span>Add Liquidity</span>
          </button>
          <button 
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              selectedAction === 'removeLiquidity' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setSelectedAction('removeLiquidity')}
          >
            <MinusCircle size={20} />
            <span>Remove Liquidity</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Token Information */}
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-2 text-blue-800">Token A Balance</h2>
              <p className="text-2xl font-bold text-blue-600">
                {reserveA ? formatUnits(BigInt(reserveA), 18) : "Loading..."}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-2 text-purple-800">Token B Balance</h2>
              <p className="text-2xl font-bold text-purple-600">
                {reserveB ? formatUnits(BigInt(reserveB), 18) : "Loading..."}
              </p>
            </div>
          </div>

          {/* Swap/Liquidity Action Panel */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            {selectedAction === 'swap' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Swap</label>
                  <input
                    type="number"
                    value={amountToSwap}
                    onChange={e => setAmountToSwap(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {isSwappingAtoB ? "Token A → Token B" : "Token B → Token A"}
                  </span>
                  <button 
                    onClick={() => setIsSwappingAtoB(!isSwappingAtoB)}
                    className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors"
                  >
                    <ArrowDownUp size={20} />
                  </button>
                </div>

                {estimatedOutput && (
                  <div className="bg-white p-3 rounded-md border">
                    <p className="text-sm text-gray-600">Estimated Output</p>
                    <p className="text-lg font-bold">
                      {estimatedOutput} {isSwappingAtoB ? "Token B" : "Token A"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {(selectedAction === 'addLiquidity' || selectedAction === 'removeLiquidity') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedAction === 'addLiquidity' ? "Liquidity to Add" : "Liquidity to Remove"}
                  </label>
                  <input
                    type="number"
                    value={liquidityAmount}
                    onChange={e => setLiquidityAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-6">
              {!isApproved ? (
                <button 
                  onClick={handleApprove}
                  className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Zap size={20} />
                  <span>Approve Tokens</span>
                </button>
              ) : (
                <button 
                  onClick={handleSwap}
                  className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Zap size={20} />
                  <span>
                    {selectedAction === 'swap' 
                      ? (isSwappingAtoB ? "Swap A for B" : "Swap B for A")
                      : selectedAction === 'addLiquidity'
                      ? "Add Liquidity"
                      : "Remove Liquidity"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Price Information */}
        <div className="bg-gray-100 p-4 grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h3 className="text-sm text-gray-600 mb-2">Token A Price</h3>
            <p className="text-xl font-bold text-blue-600">
              {priceA ? formatUnits(BigInt(priceA), 18) : "Loading..."}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h3 className="text-sm text-gray-600 mb-2">Token B Price</h3>
            <p className="text-xl font-bold text-purple-600">
              {priceB ? formatUnits(BigInt(priceB), 18) : "Loading..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;