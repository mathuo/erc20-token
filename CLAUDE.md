# Claude Development Guide - Monorepo

This file contains information for Claude to understand the monorepo structure and development workflows.

## Project Overview

This is a comprehensive DeFi token monorepo with:
- **Smart Contracts Package**: ERC-20 tokens with advanced airdrop functionality
- **Frontend Package**: Next.js web interface for token management
- **Multi-Network Support**: Ethereum, Base, Arbitrum, Optimism, and testnets
- **Complete DeFi Stack**: Airdrops, liquidity, bridging, treasury management

## Monorepo Structure

```
defi-token-suite/
├── packages/
│   ├── contracts/          # Smart contracts (Hardhat)
│   │   ├── contracts/      # Solidity contracts
│   │   ├── scripts/        # Deployment & management scripts
│   │   ├── test/          # Contract tests
│   │   ├── deployments/   # Deployment artifacts
│   │   ├── hardhat.config.js
│   │   └── package.json
│   └── frontend/          # Web interface (Next.js)
│       ├── src/
│       │   ├── app/       # Next.js app router
│       │   ├── components/ # React components
│       │   ├── lib/       # Contract ABIs and utilities
│       │   └── hooks/     # Custom React hooks
│       ├── next.config.js
│       └── package.json
├── package.json           # Root workspace config
├── README.md             # Main documentation
└── CLAUDE.md             # This file
```

## Key Commands

### Root Workspace Commands
```bash
npm run install:all             # Install all dependencies
npm run build                   # Build all packages
npm test                        # Test all packages
npm run dev                     # Start both packages in dev mode
npm run clean                   # Clean all packages

# Package-specific commands
npm run build:contracts         # Build contracts only
npm run build:frontend          # Build frontend only
npm run test:contracts          # Test contracts only
npm run test:frontend           # Test frontend only
npm run dev:contracts           # Start Hardhat node
npm run dev:frontend            # Start Next.js dev server
```

### Contract Commands (from root)
```bash
npm run deploy:ethereum         # Deploy to Ethereum mainnet
npm run deploy:base            # Deploy to Base mainnet
npm run deploy:sepolia         # Deploy to Sepolia testnet
npm run deploy:base-sepolia    # Deploy to Base Sepolia testnet
npm run deploy:arbitrum-sepolia # Deploy to Arbitrum Sepolia testnet
npm run deploy:optimism-sepolia # Deploy to Optimism Sepolia testnet
npm run deploy:hoodi           # Deploy to Hoodi testnet
```

### Package-specific Commands

#### Contracts Package (`packages/contracts/`)
```bash
npm run compile               # Compile contracts
npm test                     # Run tests
npm run deploy:ethereum      # Deploy to Ethereum mainnet
npm run deploy:base          # Deploy to Base mainnet
npm run deploy:sepolia       # Deploy to Sepolia testnet
npm run deploy:base-sepolia  # Deploy to Base Sepolia testnet
npm run deploy:arbitrum-sepolia # Deploy to Arbitrum Sepolia testnet
npm run deploy:optimism-sepolia # Deploy to Optimism Sepolia testnet
npm run deploy:hoodi         # Deploy to Hoodi testnet

# Airdrop operations
npm run deploy-airdrop           # Deploy airdrop contracts
npm run batch-airdrop            # Execute batch airdrop
npm run create-merkle-airdrop    # Create merkle campaign
npm run create-public-campaign   # Create public claim campaign
npm run claim-merkle-airdrop     # Claim from merkle campaign
npm run claim-public-airdrop     # Claim from public campaign
npm run airdrop-status           # Check airdrop status
npm run public-airdrop-status    # Check public campaign status

# Liquidity management
npm run create-pool:base         # Create Uniswap V3 pool on Base
npm run create-pool:ethereum     # Create Uniswap V3 pool on Ethereum
npm run add-liquidity:base       # Add liquidity on Base
npm run add-liquidity:ethereum   # Add liquidity on Ethereum
npm run remove-liquidity:base    # Remove liquidity on Base
npm run remove-liquidity:ethereum # Remove liquidity on Ethereum

# Bridge operations
npm run bridge-deposit          # Bridge from Ethereum to Base
npm run bridge-withdraw         # Bridge from Base to Ethereum
npm run bridge-status           # Check bridge transaction status
npm run bridge-finalize         # Finalize bridge transaction

# Treasury management
npm run treasury                # Run treasury management operations

# Utilities
npm run export-abis             # Export ABIs for frontend
npm run verify:ethereum         # Verify contracts on Etherscan
npm run verify:base            # Verify contracts on Basescan
npm run verify:arbitrum-sepolia # Verify contracts on Arbiscan
npm run verify:optimism-sepolia # Verify contracts on Optimistic Etherscan
```

#### Frontend Package (`packages/frontend/`)
```bash
npm run dev                     # Start development server
npm run build                   # Build for production
npm run start                   # Start production server
npm run lint                    # Run ESLint
npm run type-check             # TypeScript type checking
npm test                       # Run Jest tests
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Generate test coverage
```

## File Structure Deep Dive

### Contracts Package
- `contracts/MyToken.sol` - Main ERC-20 token contract
- `contracts/BatchAirdrop.sol` - Direct batch token distribution
- `contracts/MerkleAirdrop.sol` - Merkle tree-based airdrops
- `contracts/PublicAirdrop.sol` - Open claim airdrops
- `contracts/ConditionalAirdrop.sol` - Advanced conditional claims
- `contracts/SwapHelper.sol` - Uniswap V3 integration utilities

#### Scripts Directory (`packages/contracts/scripts/`)
- `deploy.js` - Main token deployment
- `deployAirdrop.js` - Deploy airdrop contracts  
- `deployPublicAirdrop.js` - Deploy public airdrop contracts
- `executeBatchAirdrop.js` - Execute batch airdrops
- `createMerkleAirdrop.js` - Create merkle campaigns
- `createPublicCampaign.js` - Create public campaigns
- `claimMerkleAirdrop.js` - Claim from merkle campaigns
- `claimPublicAirdrop.js` - Claim from public campaigns
- `airdropStatus.js` - Monitor airdrop status
- `publicAirdropStatus.js` - Monitor public campaign status
- `createPool.js` - Create Uniswap V3 pools
- `addLiquidity.js` - Add liquidity to pools
- `removeLiquidity.js` - Remove liquidity from pools
- `bridgeDeposit.js` - Bridge tokens to Base
- `bridgeWithdraw.js` - Bridge tokens to Ethereum
- `bridgeStatus.js` - Monitor bridge transactions
- `bridgeFinalize.js` - Finalize bridge transactions
- `treasuryManager.js` - Treasury operations
- `exportABIs.js` - Export contract ABIs for frontend

### Frontend Package
- `src/app/` - Next.js 14 app router pages
- `src/components/` - Reusable React components
- `src/lib/` - Utilities, contract ABIs, and configurations
- `src/hooks/` - Custom React hooks for Web3 interactions
- `src/types/` - TypeScript type definitions
- `src/styles/` - Global CSS and Tailwind configuration

## Environment Variables

### Contracts Package (`.env`)
```bash
# Network Configuration
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-api-key
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
OPTIMISM_SEPOLIA_RPC_URL=https://sepolia.optimism.io
HOODI_RPC_URL=https://rpc.hoodi.io

# Authentication
PRIVATE_KEY=your_private_key_without_0x_prefix
ETHERSCAN_API_KEY=your_etherscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key
OPTIMISTIC_ETHERSCAN_API_KEY=your_optimistic_etherscan_api_key

# Token Configuration
TOKEN_NAME=MyToken
TOKEN_SYMBOL=MTK
MAX_SUPPLY=1000000000
INITIAL_SUPPLY=200000000
TREASURY_ADDRESS=0x0000000000000000000000000000000000000000
INITIAL_OWNER=0x0000000000000000000000000000000000000000

# Contract Addresses (populated after deployment)
TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
BATCH_AIRDROP_ADDRESS=0x0000000000000000000000000000000000000000
MERKLE_AIRDROP_ADDRESS=0x0000000000000000000000000000000000000000
PUBLIC_AIRDROP_ADDRESS=0x0000000000000000000000000000000000000000

# Airdrop Configuration
RECIPIENTS_FILE=airdrop-recipients.json
CAMPAIGN_NAME=Token Launch Airdrop
DURATION_DAYS=30
CAMPAIGN_ID=1
CAMPAIGN_TYPE=simple
TOTAL_BUDGET=10000000000000000000000
COOLDOWN_HOURS=24
MAX_CLAIMS_PER_USER=10
```

### Frontend Package (`.env.local`)
```bash
# WalletConnect
NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id

# App Configuration
NEXT_PUBLIC_APP_NAME=DeFi Token Suite
NEXT_PUBLIC_APP_DESCRIPTION=Complete DeFi token management platform

# Contract Addresses (auto-populated from contracts package)
NEXT_PUBLIC_TOKEN_ADDRESS_ETHEREUM=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_TOKEN_ADDRESS_BASE=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_TOKEN_ADDRESS_SEPOLIA=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_TOKEN_ADDRESS_BASE_SEPOLIA=0x0000000000000000000000000000000000000000

NEXT_PUBLIC_BATCH_AIRDROP_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_PUBLIC_AIRDROP_ADDRESS=0x0000000000000000000000000000000000000000

# API Keys (optional)
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key
```

## Dependencies

### Contracts Package
- `@openzeppelin/contracts` - OpenZeppelin contract library
- `@uniswap/v3-core` - Uniswap V3 core contracts
- `@uniswap/v3-periphery` - Uniswap V3 periphery contracts
- `hardhat` - Ethereum development environment
- `ethers` - Ethereum library
- `dotenv` - Environment variable management
- `merkletreejs` - Merkle tree implementation

### Frontend Package
- `next` - React framework
- `react` - UI library
- `typescript` - Type safety
- `wagmi` - React hooks for Ethereum
- `ethers` - Ethereum library
- `@rainbow-me/rainbowkit` - Wallet connection UI
- `tailwindcss` - CSS framework
- `framer-motion` - Animations

## Common Tasks for Claude

### When working with the monorepo:
1. Always specify which package you're working in
2. Use workspace commands from root when appropriate
3. Update both frontend and contracts when contracts change
4. Run `npm run export-abis` after contract changes

### When deploying:
1. Deploy contracts first: `npm run deploy:sepolia`
2. Export ABIs: `cd packages/contracts && npm run export-abis`
3. Update frontend environment variables with contract addresses
4. Build and deploy frontend: `npm run build:frontend`

### When adding new contracts:
1. Add contract to `packages/contracts/contracts/`
2. Add deployment script to `packages/contracts/scripts/`
3. Update `exportABIs.js` to include new contract
4. Add contract address to frontend environment variables
5. Create frontend components/hooks for contract interaction

### When working with airdrops:
1. **Batch airdrops**: Use for small, known recipient lists (< 500)
2. **Merkle airdrops**: Use for large, pre-defined lists (> 1000)
3. **Public airdrops**: Use for open campaigns with conditions

### When troubleshooting:
1. Check both package-specific and workspace-level dependencies
2. Verify environment variables in correct package
3. Use package-specific commands when debugging
4. Check contract deployment status and addresses
5. Verify network connectivity and RPC endpoints

### When working with the frontend:
1. Contract ABIs are automatically exported from contracts package
2. Contract addresses are managed via environment variables
3. Use Wagmi hooks for contract interactions
4. Follow Next.js 14 app router patterns

## Security Notes

- Never commit actual `.env` files - use `.env.example` templates
- Private keys should never be hardcoded in any package
- Always test on testnets before mainnet deployment
- Verify contracts on block explorers after deployment
- Use hardware wallets or multisig for production deployments
- Frontend environment variables with `NEXT_PUBLIC_` prefix are exposed to browser

## Workspace Benefits

1. **Shared dependencies**: Common packages are shared across workspace
2. **Type safety**: Frontend has access to contract types
3. **ABI synchronization**: ABIs automatically exported to frontend
4. **Unified commands**: Run operations across both packages from root
5. **Consistent versioning**: All packages version together
6. **Cross-package imports**: Frontend can import from contracts package