import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, base, sepolia, baseSepolia, arbitrumSepolia, optimismSepolia } from 'wagmi/chains'

// Define Hoodi testnet chain
const hoodi = {
  id: 560048,
  name: 'Hoodi Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://ethereum-hoodi-rpc.publicnode.com'],
    },
  },
  blockExplorers: {
    default: { name: 'HoodiScan', url: 'https://hoodi.etherscan.io' },
  },
  testnet: true,
} as const

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'DeFi Token Suite',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  chains: [mainnet, base, sepolia, baseSepolia, arbitrumSepolia, optimismSepolia, hoodi],
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
  {
    ...arbitrumSepolia,
    name: 'Arbitrum Sepolia',
    shortName: 'ARBSEP',
    icon: '🔷',
    isTestnet: true,
  },
  {
    ...optimismSepolia,
    name: 'Optimism Sepolia',
    shortName: 'OPSEP',
    icon: '🔴',
    isTestnet: true,
  },
  {
    ...hoodi,
    name: 'Hoodi Testnet',
    shortName: 'HOODI',
    icon: '🔮',
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