'use client';

import Link from 'next/link';
import { ArrowRight, Gift, Network, Zap } from 'lucide-react';
import { WalletConnection } from '@/components/web3/WalletConnection';
import { AddNetworkButton, TESTNET_CONFIGS } from '@/components/web3/AddNetworkButton';
import { AddTokenButton } from '@/components/web3/AddTokenButton';
import { useAccount, useChainId } from 'wagmi';

// Network configurations
const NETWORKS = [
  {
    slug: 'sepolia',
    chainId: 11155111,
    name: 'Sepolia Testnet',
    icon: '⚡',
    description: 'Ethereum testnet for development',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-900/20 border-yellow-600/30',
    textColor: 'text-yellow-300',
  },
  {
    slug: 'base-sepolia',
    chainId: 84532,
    name: 'Base Sepolia',
    icon: '🔵',
    description: 'Base testnet built on Optimism',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-900/20 border-blue-600/30',
    textColor: 'text-blue-300',
  },
  {
    slug: 'hoodi',
    chainId: 560048,
    name: 'Hoodi Testnet',
    icon: '🔮',
    description: 'New Ethereum testnet',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-900/20 border-purple-600/30',
    textColor: 'text-purple-300',
  },
];

export default function HomePage() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  // Get current connected network for highlighting
  const connectedNetwork = isConnected && chainId ?
    NETWORKS.find(network => network.chainId === chainId) : null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="text-center py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Gift className="h-12 w-12 text-blue-400" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Token Faucets
            </h1>
          </div>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Get free test tokens on multiple networks. Each faucet provides 50 MTK tokens every 24 hours.
          </p>

          {/* Connection Status */}
          <div className="mt-8 flex justify-center">
            <WalletConnection />
          </div>
        </div>
      </div>

      {/* Network Selection */}
      <div className="flex-1 max-w-6xl mx-auto px-6 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Choose Your Network</h2>
          <p className="text-slate-400">Select a network to access its token faucet</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {NETWORKS.map((network) => {
            const isConnected = connectedNetwork?.chainId === network.chainId;
            return (
              <Link
                key={network.slug}
                href={`/network/${network.slug}`}
                className="group block"
              >
                <div className={`
                  relative overflow-hidden rounded-2xl border transition-all duration-300
                  hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25
                  ${network.bgColor} bg-slate-800/50
                  ${isConnected ? 'border-green-500 ring-2 ring-green-500/50' : 'border-slate-700'}
                  backdrop-blur-sm
                `}>
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${network.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

                <div className="relative p-8">
                  {/* Network Icon */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <div className="text-6xl mb-4">{network.icon}</div>
                      {isConnected && (
                        <div className="absolute -top-2 -right-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {network.name}
                      {isConnected && (
                        <span className="ml-2 text-sm bg-green-600 text-green-100 px-2 py-1 rounded-full">
                          Connected
                        </span>
                      )}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {network.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Zap className="h-5 w-5 text-green-400" />
                      <span>50 MTK per claim</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Network className="h-5 w-5 text-blue-400" />
                      <span>24 hour cooldown</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Gift className="h-5 w-5 text-purple-400" />
                      <span>Unlimited claims</span>
                    </div>
                  </div>

                  {/* MetaMask Integration Buttons */}
                  <div className="mb-4 space-y-2">
                    {TESTNET_CONFIGS[network.slug] && (
                      <AddNetworkButton
                        network={TESTNET_CONFIGS[network.slug]}
                        variant="compact"
                        className="w-full"
                      />
                    )}
                    <AddTokenButton
                      variant="compact"
                      className="w-full"
                    />
                  </div>

                  {/* CTA Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <span className={`text-sm font-medium ${network.textColor}`}>
                      Chain ID: {network.chainId}
                    </span>
                    <div className="flex items-center gap-2 text-white group-hover:text-blue-400 transition-colors">
                      <span className="font-medium">Access Faucet</span>
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            );
          })}
        </div>

        {/* Quick Links Section */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-white mb-6">Quick Access Links</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {NETWORKS.map((network) => (
              <Link
                key={network.slug}
                href={`/network/${network.slug}`}
                className="group flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
              >
                <span>{network.icon}</span>
                <span className="text-slate-300 group-hover:text-white transition-colors">
                  {network.name}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </Link>
            ))}
          </div>

          {/* URL Examples */}
          <div className="mt-8 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <h4 className="text-lg font-medium text-white mb-4">Direct URLs</h4>
            <div className="space-y-2 text-sm">
              {NETWORKS.map((network) => (
                <div key={network.slug} className="flex items-center justify-center gap-2 text-slate-400">
                  <code className="bg-slate-900 px-2 py-1 rounded text-blue-300">
                    {typeof window !== 'undefined' ? `${window.location.origin}/network/${network.slug}` : `/network/${network.slug}`}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500">
        <div className="max-w-4xl mx-auto px-6">
          <p>
            MTK Token Faucets - Get free test tokens for development and testing
          </p>
          <p className="mt-2 text-sm">
            Each network provides 50 MTK tokens every 24 hours per wallet
          </p>
        </div>
      </footer>
    </div>
  );
}