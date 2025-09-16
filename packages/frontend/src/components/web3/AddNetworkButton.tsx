'use client';

import { useState } from 'react';
import { Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[];
}

interface AddNetworkButtonProps {
  network: NetworkConfig;
  variant?: 'default' | 'compact';
  className?: string;
}

export function AddNetworkButton({
  network,
  variant = 'default',
  className = ''
}: AddNetworkButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { isConnected } = useAccount();

  const addOrSwitchNetwork = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('AddNetwork button clicked for:', network.chainName);

    // Check if wallet is available
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('Wallet not detected', {
        description: 'Please install a compatible wallet to add networks',
      });
      return;
    }

    setIsAdding(true);

    try {
      // First, try to switch to the network to check if it already exists
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: network.chainId }],
        });

        // If switch succeeds, network already exists
        toast.info(`${network.chainName} already exists!`, {
          description: 'Successfully switched to this network',
        });
        return;
      } catch (switchError: any) {
        // If error code is 4902, the network doesn't exist and needs to be added
        if (switchError.code === 4902) {
          // Network doesn't exist, proceed to add it
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          });

          toast.success(`${network.chainName} added to wallet!`, {
            description: 'You can now switch to this network',
          });
        } else {
          // Some other error occurred during switch
          throw switchError;
        }
      }
    } catch (error: any) {
      console.error('Failed to add network:', error);

      if (error.code === -32002) {
        toast.error('Request pending', {
          description: 'Please check MetaMask for pending requests',
        });
      } else if (error.code === 4001) {
        toast.error('Request rejected', {
          description: 'Network addition was rejected by user',
        });
      } else {
        toast.error('Failed to add network', {
          description: error.message || 'Unknown error occurred',
        });
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={(e) => addOrSwitchNetwork(e)}
        disabled={isAdding}
        className={`
          flex items-center gap-2 px-4 py-2 text-sm font-medium
          bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50
          text-white rounded-md transition-all duration-200
          border border-blue-500/30 hover:border-blue-400/50
          shadow-sm hover:shadow-md hover:shadow-blue-500/25
          ${isAdding ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        title={`Add ${network.chainName} testnet to wallet`}
      >
        {isAdding ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        <span>Add Testnet</span>
      </button>
    );
  }

  return (
    <button
      onClick={(e) => addOrSwitchNetwork(e)}
      disabled={isAdding}
      className={`
        flex items-center justify-center gap-3 w-full p-4
        bg-gradient-to-r from-blue-600 to-blue-700
        hover:from-blue-700 hover:to-blue-800
        disabled:from-blue-600/50 disabled:to-blue-700/50
        text-white font-medium rounded-xl transition-all duration-200
        border border-blue-500/20 hover:border-blue-400/30
        shadow-lg hover:shadow-xl hover:shadow-blue-500/25
        ${isAdding ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        ${className}
      `}
      title={`Add ${network.chainName} testnet to wallet`}
    >
      <div className="flex items-center gap-3">
        {isAdding ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <ExternalLink className="w-4 h-4" />
          </div>
        )}
        <span>
          {isAdding ? 'Adding Testnet...' : `Add ${network.chainName} Testnet`}
        </span>
      </div>
    </button>
  );
}

// Network configurations for testnets
export const TESTNET_CONFIGS: Record<string, NetworkConfig> = {
  sepolia: {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia Ether (Testnet)',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://ethereum-sepolia-rpc.publicnode.com',
      'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    ],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  'base-sepolia': {
    chainId: '0x14a34', // 84532 in hex
    chainName: 'Base Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia Ether (Testnet)',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://sepolia.base.org',
      'https://base-sepolia-rpc.publicnode.com',
    ],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
  },
  hoodi: {
    chainId: '0x88930', // 560048 in hex
    chainName: 'Hoodi Testnet',
    nativeCurrency: {
      name: 'Ether (Testnet)',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://ethereum-hoodi-rpc.publicnode.com',
    ],
    blockExplorerUrls: ['https://hoodi.etherscan.io'],
  },
};