'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { toast } from 'sonner';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { WalletConnection } from '@/components/web3/WalletConnection';
import { NetworkSelector } from '@/components/web3/NetworkSelector';
import { CampaignCard } from '@/components/airdrop/CampaignCard';
import { AddNetworkButton, TESTNET_CONFIGS } from '@/components/web3/AddNetworkButton';
import { AddTokenButton } from '@/components/web3/AddTokenButton';
import { useClaimTokens } from '@/hooks/usePublicAirdrop';
import { getContractAddress } from '@/lib/contracts/addresses';
import { supportedChains } from '@/lib/wagmi/config';

// Network slug mapping
const NETWORK_SLUGS = {
  'sepolia': 11155111,
  'base-sepolia': 84532,
  'hoodi': 560048,
  'ethereum': 1,
  'base': 8453,
} as const;

type NetworkSlug = keyof typeof NETWORK_SLUGS;

interface NetworkPageClientProps {
  networkSlug: string;
}

export default function NetworkPageClient({ networkSlug }: NetworkPageClientProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [targetChainId, setTargetChainId] = useState<number | null>(null);
  const [isValidNetwork, setIsValidNetwork] = useState(false);

  // Validate network slug and get chain ID
  useEffect(() => {
    const slug = networkSlug.toLowerCase() as NetworkSlug;
    const networkChainId = NETWORK_SLUGS[slug];

    if (networkChainId) {
      setTargetChainId(networkChainId);
      setIsValidNetwork(true);
    } else {
      setIsValidNetwork(false);
      toast.error(`Invalid network: ${networkSlug}`);
      router.push('/');
    }
  }, [networkSlug, router]);

  // Auto-switch to target network if connected to wrong network
  useEffect(() => {
    if (isConnected && targetChainId && chainId !== targetChainId) {
      switchChain({ chainId: targetChainId });
    }
  }, [isConnected, targetChainId, chainId, switchChain]);

  // Get network info
  const networkInfo = supportedChains.find(chain => chain.id === targetChainId);
  const contractAddress = targetChainId ? getContractAddress(targetChainId as any, 'PublicAirdrop') : '';

  // Claim hook
  const {
    claim,
    isPending: isLoading,
    error
  } = useClaimTokens();

  const handleClaim = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (chainId !== targetChainId) {
      toast.error(`Please switch to ${networkInfo?.name}`);
      return;
    }

    try {
      const campaignId = BigInt(targetChainId === 11155111 ? 1 : 4);
      claim(campaignId);
      toast.success('Tokens claimed successfully!', {
        description: 'You received MTK tokens',
      });
    } catch (error) {
      console.error('Claim failed:', error);
      toast.error('Claim failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  if (!isValidNetwork || !targetChainId || !networkInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Invalid Network</h1>
          <p className="text-slate-400 mb-6">The network &quot;{networkSlug}&quot; is not supported.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Home Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                     text-slate-400 hover:text-white
                     bg-slate-800/50 hover:bg-slate-700/50
                     border border-slate-700 hover:border-slate-600
                     rounded-lg transition-all duration-200
                     hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">{networkInfo.icon}</span>
            <h1 className="text-4xl font-bold text-white">
              {networkInfo.name} Token Faucet
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Claim MTK tokens every 24 hours on {networkInfo.name}
          </p>
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">Network:</span>
              <NetworkSelector />
            </div>
            {/* MetaMask integration buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              {/* Add Network to MetaMask button for testnets */}
              {targetChainId && TESTNET_CONFIGS[networkSlug.toLowerCase()] && (
                <AddNetworkButton
                  network={TESTNET_CONFIGS[networkSlug.toLowerCase()]}
                  variant="compact"
                />
              )}
              {/* Add Token to MetaMask button */}
              <AddTokenButton variant="compact" />
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mb-8 flex justify-center">
          <WalletConnection />
        </div>

        {/* Network Mismatch Warning */}
        {isConnected && chainId !== targetChainId && (
          <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">⚠️</span>
              <span className="text-yellow-200">
                Please switch to {networkInfo.name} network to claim tokens
              </span>
            </div>
          </div>
        )}

        {/* Campaign Card */}
        {contractAddress && (
          <div className="max-w-md mx-auto">
            <CampaignCard
              campaignId={BigInt(targetChainId === 11155111 ? 1 : 4)} // Sepolia uses campaign 1, others use 4
              tokenSymbol="MTK"
              onClaim={(campaignId) => handleClaim()}
              isClaimPending={isLoading}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>Direct link to this faucet: <code className="bg-slate-800 px-2 py-1 rounded">
            {typeof window !== 'undefined' ? window.location.href : ''}
          </code></p>
        </div>
      </div>
    </div>
  );
}