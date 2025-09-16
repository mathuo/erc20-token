'use client';

import { useState } from 'react';
import { Plus, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount, useChainId } from 'wagmi';
import { getContractAddress, type ChainId } from '@/lib/contracts/addresses';

interface AddTokenButtonProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function AddTokenButton({
  variant = 'default',
  className = ''
}: AddTokenButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { isConnected } = useAccount();
  const chainId = useChainId() as ChainId;

  const addToken = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isConnected) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet first',
      });
      return;
    }

    // Check if wallet is available
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('Wallet not detected', {
        description: 'Please install a compatible wallet to add tokens',
      });
      return;
    }

    const tokenAddress = getContractAddress(chainId, 'MyToken');
    if (!tokenAddress) {
      toast.error('Token not available', {
        description: 'MTK token is not deployed on this network',
      });
      return;
    }

    setIsAdding(true);

    try {
      // Use the general ethereum provider for watching assets
      const wasAdded = await (window as any).ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: 'MTK',
            decimals: 18,
            // You can add a token logo here if you have one
            // image: 'https://your-domain.com/mtk-logo.png',
          },
        },
      });

      if (wasAdded) {
        toast.success('MTK token added to wallet!', {
          description: 'You can now see your MTK balance in your wallet',
        });
      } else {
        toast.error('Token addition cancelled', {
          description: 'Token was not added to wallet',
        });
      }
    } catch (error: any) {
      console.error('Failed to add token:', error);

      if (error.code === -32002) {
        toast.error('Request pending', {
          description: 'Please check MetaMask for pending requests',
        });
      } else if (error.code === 4001) {
        toast.error('Request rejected', {
          description: 'Token addition was rejected by user',
        });
      } else {
        toast.error('Failed to add token', {
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
        onClick={(e) => addToken(e)}
        disabled={isAdding || !isConnected}
        className={`
          flex items-center gap-2 px-4 py-2 text-sm font-medium
          bg-green-600 hover:bg-green-700 disabled:bg-green-600/50
          text-white rounded-md transition-all duration-200
          border border-green-500/30 hover:border-green-400/50
          shadow-sm hover:shadow-md hover:shadow-green-500/25
          ${isAdding ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        title="Add MTK token to wallet"
      >
        {isAdding ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Coins className="w-4 h-4" />
        )}
        <span>Add MTK Token</span>
      </button>
    );
  }

  return (
    <button
      onClick={(e) => addToken(e)}
      disabled={isAdding || !isConnected}
      className={`
        flex items-center justify-center gap-3 w-full p-4
        bg-gradient-to-r from-green-600 to-green-700
        hover:from-green-700 hover:to-green-800
        disabled:from-green-600/50 disabled:to-green-700/50
        text-white font-medium rounded-xl transition-all duration-200
        border border-green-500/20 hover:border-green-400/30
        shadow-lg hover:shadow-xl hover:shadow-green-500/25
        ${isAdding ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        ${className}
      `}
      title="Add MTK token to MetaMask"
    >
      <div className="flex items-center gap-3">
        {isAdding ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            <Plus className="w-4 h-4" />
          </div>
        )}
        <span>
          {isAdding ? 'Adding MTK Token...' : 'Add MTK Token to Wallet'}
        </span>
      </div>
    </button>
  );
}