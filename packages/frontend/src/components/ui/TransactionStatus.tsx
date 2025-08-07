'use client';

import * as React from 'react';
import { ExternalLink, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { useChainId } from 'wagmi';
import { getChainById } from '@/lib/wagmi/config';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';
import { truncateAddress } from '@/lib/utils';

export interface TransactionStatusProps {
  hash?: string;
  isPending?: boolean;
  isConfirmed?: boolean;
  error?: Error | null;
  onDismiss?: () => void;
  className?: string;
}

export function TransactionStatus({
  hash,
  isPending,
  isConfirmed,
  error,
  onDismiss,
  className
}: TransactionStatusProps) {
  const chainId = useChainId();
  const currentChain = getChainById(chainId);
  
  const getExplorerUrl = () => {
    if (!hash || !currentChain?.blockExplorers?.default) return null;
    return `${currentChain.blockExplorers.default.url}/tx/${hash}`;
  };

  const getStatus = () => {
    if (error) return { variant: 'error' as const, label: 'Failed', icon: XCircle };
    if (isConfirmed) return { variant: 'success' as const, label: 'Confirmed', icon: CheckCircle };
    if (isPending) return { variant: 'active' as const, label: 'Pending', icon: Loader2 };
    return { variant: 'neutral' as const, label: 'Ready', icon: Clock };
  };

  const status = getStatus();
  const Icon = status.icon;

  if (!hash && !isPending && !error) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${
            error ? 'bg-red-900/20' :
            isConfirmed ? 'bg-green-900/20' :
            isPending ? 'bg-blue-900/20' :
            'bg-gray-800'
          }`}>
            <Icon className={`h-5 w-5 ${
              error ? 'text-red-400' :
              isConfirmed ? 'text-green-400' :
              isPending ? 'text-blue-400 animate-spin' :
              'text-gray-400'
            }`} />
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-foreground">
                Transaction {status.label}
              </span>
              <StatusBadge variant={status.variant}>
                {status.label}
              </StatusBadge>
            </div>
            
            {hash && (
              <div className="flex items-center space-x-2 mt-1">
                <code className="text-sm text-muted-foreground font-mono">
                  {truncateAddress(hash, 6)}
                </code>
                {getExplorerUrl() && (
                  <a
                    href={getExplorerUrl()!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
            
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {error.message}
              </p>
            )}
          </div>
        </div>

        {onDismiss && (isConfirmed || error) && (
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="sm"
          >
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}