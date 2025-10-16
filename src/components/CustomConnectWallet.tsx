import React from "react";
import { ConnectButton } from "@suiet/wallet-kit";

interface CustomConnectWalletProps {
  className?: string;
}

const CustomConnectWallet: React.FC<CustomConnectWalletProps> = ({ className = "" }) => {
  return (
    <div className={`${className} flex flex-col items-center`}>
      <div className="flex flex-col items-center">
        <h2 className="text-4xl font-bold text-white mb-2">Verified Wallets</h2>
        <div className="bg-purple-900 text-white rounded-full px-6 py-2 mb-6">
          Up to +500 points
        </div>
        <p className="text-gray-400 text-xl mb-10">
          Add onchain data to your profile. They are public by default*.
        </p>
      </div>
      
      <div className="border border-dashed border-gray-600 rounded-lg p-16 flex flex-col items-center justify-center relative w-96 h-96">
        <div className="absolute top-2 right-2 w-3 h-3 bg-gray-400 rounded-full"></div>
        <img 
          src="/wallet.png" 
          alt="Wallet" 
          className="w-16 h-16 object-contain mb-4" 
        />
        <ConnectButton className="bg-transparent border-none text-white text-2xl font-normal hover:bg-transparent hover:text-white">
          Connect Wallet
        </ConnectButton>
      </div>
      
      <p className="text-gray-500 mt-8 max-w-2xl text-center">
        *Privacy note: Wallets are public by default, but you will soon be able to make them private.
        Private wallets will still count towards your Builder Score.
      </p>
    </div>
  );
};

export default CustomConnectWallet;
