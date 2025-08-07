'use client';

import * as React from 'react';
import { useAccount, useChainId } from 'wagmi';
import { RefreshCw, Gift, Zap, Network } from 'lucide-react';
import { WalletConnection } from '@/components/web3/WalletConnection';
import { NetworkSelector } from '@/components/web3/NetworkSelector';
import { CampaignCard } from '@/components/airdrop/CampaignCard';
import { Button } from '@/components/ui/Button';
import { usePublicAirdrop, useClaimTokens } from '@/hooks/usePublicAirdrop';
import { getChainById } from '@/lib/wagmi/config';
import { NETWORK_NAMES } from '@/lib/contracts/addresses';
import { formatTokenAmount } from '@/lib/utils';
import { toast } from 'sonner';

export default function HomePage() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [selectedNetwork, setSelectedNetwork] = React.useState<number>(chainId);

  const {
    contractAddress,
    tokenAddress,
    tokenName,
    tokenSymbol,
    tokenBalance,
    activeCampaigns,
    isLoadingCampaigns,
    refetchCampaigns,
    refetchBalance,
  } = usePublicAirdrop();

  const {
    claim,
    hash,
    isPending: isClaimPending,
    isConfirmed,
    error: claimError,
    reset: resetClaim,
  } = useClaimTokens();

  const currentChain = getChainById(chainId);
  const hasContracts = Boolean(contractAddress && tokenAddress);

  // Handle successful claim
  React.useEffect(() => {
    if (isConfirmed && hash) {
      toast.success('Tokens claimed successfully!', {
        description: `Transaction: ${hash}`,
        action: {
          label: 'View',
          onClick: () => window.open(
            `${currentChain?.blockExplorers?.default?.url}/tx/${hash}`,
            '_blank'
          ),
        },
      });
      refetchCampaigns();
      refetchBalance();
      resetClaim();
    }
  }, [isConfirmed, hash, refetchCampaigns, refetchBalance, resetClaim, currentChain]);

  // Handle claim error
  React.useEffect(() => {
    if (claimError) {
      toast.error('Claim failed', {
        description: claimError.message,
      });
    }
  }, [claimError]);

  const handleClaim = (campaignId: bigint) => {
    try {
      claim(campaignId);
    } catch (error) {
      toast.error('Failed to initiate claim', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleRefresh = () => {
    refetchCampaigns();
    refetchBalance();
    toast.success('Data refreshed');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
          Token Airdrops
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Claim tokens from public airdrop campaigns on multiple networks.
          Connect your wallet and choose a network to get started.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <NetworkSelector
            onNetworkChange={setSelectedNetwork}
            className="min-w-[200px]"
          />
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={!hasContracts}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <WalletConnection />
      </div>

      {/* Network Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Network className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Current Network:</span>
              <span className="text-lg">{currentChain?.icon}</span>
              <span className="font-semibold">
                {NETWORK_NAMES[chainId as keyof typeof NETWORK_NAMES] || 'Unknown'}
              </span>
              {currentChain?.isTestnet && (
                <span className="px-2 py-1 text-xs bg-yellow-900/20 text-yellow-400 border border-yellow-800/30 rounded-full">
                  Testnet
                </span>
              )}
            </div>
          </div>

          {isConnected && hasContracts && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Your Balance
              </div>
              <div className="font-semibold text-lg">
                {tokenBalance ? formatTokenAmount(tokenBalance) : '0'} {tokenSymbol}
              </div>
            </div>
          )}
        </div>

        {!hasContracts && (
          <div className="mt-4 p-4 bg-yellow-900/20 rounded-lg border border-yellow-800/30">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-200 font-medium">
                No contracts deployed on this network
              </span>
            </div>
            <p className="text-yellow-300 text-sm mt-1">
              Switch to a supported network to view and claim from campaigns.
            </p>
          </div>
        )}

        {hasContracts && (
          <div className="mt-4 text-sm text-muted-foreground space-y-1">
            <div>Token: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">{tokenAddress}</code></div>
            <div>Airdrop: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">{contractAddress}</code></div>
          </div>
        )}
      </div>

      {/* Main Content */}
      {!isConnected ? (
        <div className="text-center py-12">
          <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view and claim from available campaigns.
          </p>
          <WalletConnection showBalance={false} showChainInfo={false} />
        </div>
      ) : !hasContracts ? (
        <div className="text-center py-12">
          <Network className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Network Not Supported
          </h2>
          <p className="text-muted-foreground mb-6">
            No airdrop contracts are deployed on the current network.
            Please switch to a supported network.
          </p>
          <NetworkSelector className="max-w-sm mx-auto" />
        </div>
      ) : (
        <div>
          {/* Campaigns Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Active Campaigns
              </h2>
              <p className="text-muted-foreground">
                {tokenName} ({tokenSymbol}) on {currentChain?.name}
              </p>
            </div>
            {activeCampaigns && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Available Campaigns
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {activeCampaigns.length}
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoadingCampaigns ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 h-80"></div>
                </div>
              ))}
            </div>
          ) : activeCampaigns && activeCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCampaigns.map((campaignId) => (
                <CampaignCard
                  key={campaignId.toString()}
                  campaignId={campaignId}
                  tokenSymbol={tokenSymbol || 'TOKEN'}
                  onClaim={handleClaim}
                  isClaimPending={isClaimPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Active Campaigns
              </h3>
              <p className="text-muted-foreground mb-4">
                There are no active airdrop campaigns on this network at the moment.
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}