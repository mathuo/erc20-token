import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, base, sepolia, baseSepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'DeFi Token Suite',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  chains: [mainnet, base, sepolia, baseSepolia],
  ssr: true,
})

// Chain configurations
export const supportedChains = [
  {
    ...mainnet,
    name: 'Ethereum',
    shortName: 'ETH',
    icon: '⟠',
    isTestnet: false,
  },
  {
    ...base,
    name: 'Base',
    shortName: 'BASE',
    icon: '🟦',
    isTestnet: false,
  },
  {
    ...sepolia,
    name: 'Sepolia',
    shortName: 'SEP',
    icon: '⚡',
    isTestnet: true,
  },
  {
    ...baseSepolia,
    name: 'Base Sepolia',
    shortName: 'BSEP',
    icon: '🔵',
    isTestnet: true,
  },
]

export const getChainById = (chainId: number) => {
  return supportedChains.find(chain => chain.id === chainId)
}

export const isTestnet = (chainId: number) => {
  const chain = getChainById(chainId)
  return chain?.isTestnet ?? false
}