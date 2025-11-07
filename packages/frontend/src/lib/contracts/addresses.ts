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
    MyToken: '0x42128Ea03543239CFa813822F7C6c629112bB3a6',
    BatchAirdrop: process.env.NEXT_PUBLIC_BATCH_AIRDROP_ADDRESS_SEPOLIA || '',
    MerkleAirdrop: process.env.NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS_SEPOLIA || '',
    PublicAirdrop: '0x001f2D4CEfC364CCe7B9db788f1C3Bb790Aff097',
  },

  // Base Sepolia Testnet
  84532: {
    MyToken: '0xCD868868d558e610091a249451ce95689038b421',
    BatchAirdrop: process.env.NEXT_PUBLIC_BATCH_AIRDROP_ADDRESS_BASE_SEPOLIA || '',
    MerkleAirdrop: process.env.NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS_BASE_SEPOLIA || '',
    PublicAirdrop: '0x84ed9cFaBC7639bfd4e1771E71387e394e16762b',
  },

  // Arbitrum Sepolia Testnet
  421614: {
    MyToken: '0xE41b45f227134A8cA5fd19CB2c263d27e0cE533B',
    BatchAirdrop: '',
    MerkleAirdrop: '',
    PublicAirdrop: '0xD763F2ac003fbe23Ba2A10fc9Ef1037cB4721308',
  },

  // Optimism Sepolia Testnet  
  11155420: {
    MyToken: '0x42128Ea03543239CFa813822F7C6c629112bB3a6',
    BatchAirdrop: '',
    MerkleAirdrop: '',
    PublicAirdrop: '0xac1Ac1bd8d82531d97B86c40b5933DbDF1Fa91A1',
  },

  // Hoodi Testnet
  560048: {
    MyToken: '0xE41b45f227134A8cA5fd19CB2c263d27e0cE533B',
    BatchAirdrop: '0xD763F2ac003fbe23Ba2A10fc9Ef1037cB4721308',
    MerkleAirdrop: '0x42128Ea03543239CFa813822F7C6c629112bB3a6',
    PublicAirdrop: '0xac1Ac1bd8d82531d97B86c40b5933DbDF1Fa91A1',
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
  421614: 'Arbitrum Sepolia',
  11155420: 'Optimism Sepolia',
  560048: 'Hoodi Testnet',
  31337: 'Localhost'
} as const