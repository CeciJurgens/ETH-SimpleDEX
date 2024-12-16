"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Zap, PlusCircle } from "lucide-react";
import { useScaffoldWriteContract, useScaffoldReadContract } from "../../hooks/scaffold-eth";
import { formatUnits, parseEther } from "viem";
import React from "react";

const TokenBPage = () => {
  const [mintAmount, setMintAmount] = useState<string>("0");
  const account = useAccount();

  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "TokenB",
    functionName: "balanceOf",
    args: [account.address],
  });

  const { writeContractAsync: mintTokens } = useScaffoldWriteContract("TokenB");

  const handleMint = async () => {
    try {
      await mintTokens({
        functionName: "mint",
        args: [account.address, parseEther(mintAmount)],
      });
      alert(`${mintAmount} Token B minted successfully!`);
      setMintAmount("0");
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Minting failed!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
          <h1 className="text-3xl font-bold text-white text-center flex items-center justify-center space-x-2">
            <Zap className="w-8 h-8" />
            <span>Token B Management</span>
          </h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2 text-purple-800">Your Token B Balance</h2>
            <p className="text-2xl font-bold text-purple-600">
              {tokenBalance 
                ? `${parseFloat(formatUnits(BigInt(tokenBalance), 18)).toFixed(2)} TKB` 
                : "Loading..."}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Mint
            </label>
            <input
              type="number"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="Enter amount to mint"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button 
            onClick={handleMint}
            disabled={!account.address || mintAmount === "0"}
            className="w-full py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <PlusCircle size={20} />
            <span>Mint Tokens</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenBPage;