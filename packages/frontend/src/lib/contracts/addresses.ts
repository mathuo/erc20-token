// Contract addresses by network
// Update these after deployment

export const CONTRACT_ADDRESSES = {
  // Ethereum Mainnet
  1: {
    MyToken: process.env.NEXT_PUBLIC_TOKEN_ADDRESS_ETHEREUM || '',
    BatchAirdrop: process.env.NEXT_PUBLIC_BATCH_AIRDROP_ADDRESS_ETHEREUM || '',
    MerkleAirdrop: process.env.NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS_ETHEREUM || '',
    PublicAirdrop: process.env.NEXT_PUBLIC_PUBLIC_AIRDROP_ADDRESS_ETHEREUM || '',
  },
  
  // Base Mainnet  
  8453: {
    MyToken: process.env.NEXT_PUBLIC_TOKEN_ADDRESS_BASE || '',
    BatchAirdrop: process.env.NEXT_PUBLIC_BATCH_AIRDROP_ADDRESS_BASE || '',
    MerkleAirdrop: process.env.NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS_BASE || '',
    PublicAirdrop: process.env.NEXT_PUBLIC_PUBLIC_AIRDROP_ADDRESS_BASE || '',
  },
  
  // Sepolia Testnet
  11155111: {
    MyToken: process.env.NEXT_PUBLIC_TOKEN_ADDRESS_SEPOLIA || '',
    BatchAirdrop: process.env.NEXT_PUBLIC_BATCH_AIRDROP_ADDRESS_SEPOLIA || '',
    MerkleAirdrop: process.env.NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS_SEPOLIA || '',
    PublicAirdrop: process.env.NEXT_PUBLIC_PUBLIC_AIRDROP_ADDRESS_SEPOLIA || '',
  },
  
  // Base Sepolia Testnet
  84532: {
    MyToken: process.env.NEXT_PUBLIC_TOKEN_ADDRESS_BASE_SEPOLIA || '',
    BatchAirdrop: process.env.NEXT_PUBLIC_BATCH_AIRDROP_ADDRESS_BASE_SEPOLIA || '',
    MerkleAirdrop: process.env.NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS_BASE_SEPOLIA || '',
    PublicAirdrop: process.env.NEXT_PUBLIC_PUBLIC_AIRDROP_ADDRESS_BASE_SEPOLIA || '',
  },
  
  // Localhost
  31337: {
    MyToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    BatchAirdrop: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    MerkleAirdrop: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', 
    PublicAirdrop: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  }
} as const

export type ChainId = keyof typeof CONTRACT_ADDRESSES
export type ContractName = keyof typeof CONTRACT_ADDRESSES[ChainId]

export function getContractAddress(chainId: ChainId, contractName: ContractName): string {
  const address = CONTRACT_ADDRESSES[chainId]?.[contractName]
  if (!address) {
    console.warn(`No address found for ${contractName} on chain ${chainId}`)
  }
  return address || ''
}

// Network names
export const NETWORK_NAMES = {
  1: 'Ethereum',
  8453: 'Base',
  11155111: 'Sepolia',
  84532: 'Base Sepolia',
  31337: 'Localhost'
} as const