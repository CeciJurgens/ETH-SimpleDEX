import React from "react";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { HeartIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <footer className="bg-white/90 backdrop-blur-md shadow-md py-4">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* BuidlGuidl Section */}
        <div className="flex items-center space-x-2 text-gray-700">
          <p className="flex items-center gap-1">
            Built with <HeartIcon className="inline-block h-4 w-4 text-red-500" /> at
            </p>
              <a className="flex items-center gap-1 ml-1 text-blue-600 hover:text-blue-800 transition-colors"            
              href="https://buidlguidl.com/"
              target="_blank"
              rel="noreferrer"
            >
              <BuidlGuidlLogo className="w-4 h-6 pb-1" />
              <span className="underline">BuidlGuidl</span>
            </a>
        </div>

        {/* Support Link */}
        <div className="flex items-center space-x-4">
          <a href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA" target="_blank" rel="noreferrer"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Support
          </a>
          {/* Theme Switch */}
          <SwitchTheme 
            className={`${isLocalNetwork ? "self-end md:self-auto" : ""} text-gray-700 hover:text-blue-600`} 
          />
        </div>
      </div>
    </footer>
  );
};