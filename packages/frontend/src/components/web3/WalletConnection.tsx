'use client';

import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { Wallet, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { truncateAddress, copyToClipboard, formatTokenAmount } from '@/lib/utils';
import { getChainById } from '@/lib/wagmi/config';
import { toast } from 'sonner';

interface WalletConnectionProps {
  showBalance?: boolean;
  showChainInfo?: boolean;
  className?: string;
}

export function WalletConnection({ 
  showBalance = true, 
  showChainInfo = true,
  className 
}: WalletConnectionProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  
  const currentChain = getChainById(chainId);

  const handleCopyAddress = async () => {
    if (address) {
      const success = await copyToClipboard(address);
      toast(success ? 'Address copied!' : 'Failed to copy address');
    }
  };

  const getBlockExplorerUrl = () => {
    if (!address || !currentChain?.blockExplorers?.default) return null;
    return `${currentChain.blockExplorers.default.url}/address/${address}`;
  };

  return (
    <div className={className}>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          // Loading state
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === 'authenticated');

          if (!ready) {
            return (
              <div className="animate-pulse">
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            );
          }

          if (!connected) {
            return (
              <Button
                onClick={openConnectModal}
                variant="gradient"
                size="lg"
                className="font-semibold"
              >
                <Wallet className="h-5 w-5 mr-2" />
                Connect Wallet
              </Button>
            );
          }

          if (chain.unsupported) {
            return (
              <Button
                onClick={openChainModal}
                variant="destructive"
                size="lg"
              >
                Unsupported Network
              </Button>
            );
          }

          return (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Account Info */}
              <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-medium">
                      {truncateAddress(account.address, 4)}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    {getBlockExplorerUrl() && (
                      <a
                        href={getBlockExplorerUrl()!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  
                  {showBalance && balance && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTokenAmount(balance.value, balance.decimals, 4)} {balance.symbol}
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={openAccountModal}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  Manage
                </Button>
              </div>

              {/* Chain Info */}
              {showChainInfo && (
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm min-w-[140px]">
                  <span className="text-lg">{currentChain?.icon || '⚠️'}</span>
                  <div>
                    <div className="font-medium text-sm">{chain.name}</div>
                    {currentChain?.isTestnet && (
                      <div className="text-xs text-yellow-400">
                        Testnet
                      </div>
                    )}
                  </div>
                  {chain.unsupported && (
                    <Button
                      onClick={openChainModal}
                      variant="outline"
                      size="sm"
                    >
                      Switch
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}