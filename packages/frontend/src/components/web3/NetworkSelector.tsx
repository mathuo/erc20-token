'use client';

import * as React from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { supportedChains, getChainById } from '@/lib/wagmi/config';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface NetworkSelectorProps {
  onNetworkChange?: (chainId: number) => void;
  className?: string;
}

export function NetworkSelector({ onNetworkChange, className }: NetworkSelectorProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const currentChain = getChainById(chainId);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNetworkSwitch = async (targetChainId: number) => {
    try {
      if (isConnected) {
        switchChain({ chainId: targetChainId });
      }
      onNetworkChange?.(targetChainId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const supportedMainnets = supportedChains.filter(chain => !chain.isTestnet);
  const supportedTestnets = supportedChains.filter(chain => chain.isTestnet);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between min-w-[180px]"
        disabled={isPending}
      >
        <div className="flex items-center space-x-2">
          {currentChain ? (
            <>
              <span className="text-lg">{currentChain.icon}</span>
              <span>{currentChain.name}</span>
              {currentChain.isTestnet && (
                <span className="px-2 py-1 text-xs bg-yellow-900/20 text-yellow-400 border border-yellow-800/30 rounded-full">
                  Testnet
                </span>
              )}
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span>Unsupported Network</span>
            </>
          )}
        </div>
        <ChevronDown 
          className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )} 
        />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          {/* Mainnets */}
          <div className="p-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1">
              Mainnets
            </div>
            {supportedMainnets.map((chain) => (
              <NetworkOption
                key={chain.id}
                chain={chain}
                isSelected={chainId === chain.id}
                onClick={() => handleNetworkSwitch(chain.id)}
              />
            ))}
          </div>

          {supportedTestnets.length > 0 && (
            <>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="p-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1">
                  Testnets
                </div>
                {supportedTestnets.map((chain) => (
                  <NetworkOption
                    key={chain.id}
                    chain={chain}
                    isSelected={chainId === chain.id}
                    onClick={() => handleNetworkSwitch(chain.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface NetworkOptionProps {
  chain: typeof supportedChains[0];
  isSelected: boolean;
  onClick: () => void;
}

function NetworkOption({ chain, isSelected, onClick }: NetworkOptionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-colors',
        'hover:bg-slate-700/50',
        isSelected && 'bg-blue-900/20 border border-blue-800/30'
      )}
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg">{chain.icon}</span>
        <div>
          <div className="font-medium">{chain.name}</div>
          <div className="text-sm text-muted-foreground">
            {chain.shortName}
          </div>
        </div>
        {chain.isTestnet && (
          <span className="px-2 py-1 text-xs bg-yellow-900/20 text-yellow-400 border border-yellow-800/30 rounded-full">
            Testnet
          </span>
        )}
      </div>
      {isSelected && (
        <Check className="h-4 w-4 text-blue-400" />
      )}
    </button>
  );
}