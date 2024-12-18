"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, ArrowDownUp, PlusCircle, MinusCircle } from "lucide-react";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "SimpleDEX",
    href: "/",
    icon: <ArrowDownUp className="h-4 w-4" />,
  },
  
  {
    label: "Token A",
    href: "/tokenA",
    icon: <MinusCircle className="h-4 w-4" />,
  },

  {
    label: "Token B",
    href: "/tokenB",
    icon: <MinusCircle className="h-4 w-4" />,
  },

  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <PlusCircle className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), [])
  );

  return (
    <div className="sticky top-0 z-20 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <Zap className="text-blue-500 w-8 h-8" />
          <Link href="/" className="text-2xl font-bold text-gray-800">
            SimpleDEX
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-4">
            <HeaderMenuLinks />
          </ul>
        </nav>

        {/* Connect Wallet */}
        <div className="flex items-center bg-white text-gray-600 space-x-4">
          <RainbowKitCustomConnectButton />
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="text-gray-600 hover:text-gray-1000"
          >
            {isDrawerOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <RainbowKitCustomConnectButton />
            <ul className="space-y-2 mt-4">
              <HeaderMenuLinks />
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};