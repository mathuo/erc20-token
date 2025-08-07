# 🚀 DeFi Token Suite

A comprehensive monorepo for DeFi token management with smart contracts and web interface.

## 📋 Overview

This monorepo contains:
- **Smart Contracts**: ERC-20 tokens with advanced airdrop functionality
- **Web Interface**: Next.js frontend for token management
- **Multi-Network Support**: Ethereum, Base, and testnets
- **Complete DeFi Stack**: Airdrops, liquidity, bridging, treasury

## 🏗️ Project Structure

```
defi-token-suite/
├── packages/
│   ├── contracts/          # Smart contracts (Hardhat)
│   │   ├── contracts/      # Solidity contracts
│   │   ├── scripts/        # Deployment & management scripts
│   │   ├── test/          # Contract tests
│   │   └── deployments/   # Deployment artifacts
│   └── frontend/          # Web interface (Next.js)
│       ├── src/
│       │   ├── app/       # Next.js app router
│       │   ├── components/ # React components
│       │   ├── lib/       # Utilities & ABIs
│       │   └── hooks/     # Custom React hooks
│       └── public/        # Static assets
├── package.json           # Root workspace config
└── README.md             # This file
```

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- npm 8+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/defi-token-suite.git
cd defi-token-suite

# Install all dependencies
npm run install:all

# Or install individually
npm install                    # Root workspace
npm run install:contracts      # Contracts only
npm run install:frontend       # Frontend only
```

### Development

```bash
# Start both contracts and frontend in development mode
npm run dev

# Or start individually
npm run dev:contracts          # Local Hardhat node
npm run dev:frontend           # Next.js dev server
```

### Build & Test

```bash
# Build everything
npm run build

# Test everything  
npm test

# Or build/test individually
npm run build:contracts        # Compile contracts
npm run build:frontend         # Build Next.js app
npm run test:contracts         # Run contract tests
npm run test:frontend          # Run frontend tests
```

## 🏗️ Smart Contracts

### Core Contracts

- **MyToken.sol**: ERC-20 token with minting, burning, and treasury
- **BatchAirdrop.sol**: Direct batch token distribution
- **MerkleAirdrop.sol**: Scalable merkle tree-based airdrops  
- **PublicAirdrop.sol**: Open claim airdrops with conditions
- **ConditionalAirdrop.sol**: Advanced conditional claim logic
- **SwapHelper.sol**: Uniswap V3 integration utilities

### Deployment

```bash
# Deploy to testnets
npm run deploy:sepolia
npm run deploy:base-sepolia

# Deploy to mainnets
npm run deploy:ethereum
npm run deploy:base
```

### Contract Management

```bash
# Navigate to contracts package
cd packages/contracts

# Airdrop operations
npm run deploy-airdrop         # Deploy airdrop contracts
npm run batch-airdrop          # Execute batch airdrop
npm run create-merkle-airdrop  # Create merkle campaign
npm run create-public-campaign # Create public claim campaign

# Liquidity operations  
npm run create-pool:base       # Create Uniswap pool
npm run add-liquidity:base     # Add liquidity

# Bridge operations
npm run bridge-deposit         # Bridge to Base
npm run bridge-withdraw        # Bridge to Ethereum

# Status monitoring
npm run airdrop-status         # Check airdrop status
npm run public-airdrop-status  # Check public campaigns
```

## 🖥️ Web Interface

### Tech Stack
- **Next.js 14**: React framework with app router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Wagmi**: React hooks for Ethereum
- **RainbowKit**: Wallet connection UI
- **Ethers.js**: Ethereum library

### Features

- 🔗 **Wallet Connection**: MetaMask, WalletConnect, and more
- 🪙 **Token Management**: Deploy, mint, burn, transfer
- 🎁 **Airdrop Interface**: All airdrop types with UI
- 💧 **Liquidity Tools**: Uniswap V3 position management
- 🌉 **Bridge Interface**: Cross-chain token transfers
- 📊 **Analytics Dashboard**: Token metrics and history
- 🎨 **Responsive Design**: Mobile-first interface

### Development

```bash
cd packages/frontend

# Environment setup
cp .env.example .env.local
# Edit .env.local with your configuration

# Development server
npm run dev

# Build for production
npm run build
npm run start
```

## 🌐 Supported Networks

| Network | Chain ID | Status | Features |
|---------|----------|--------|----------|
| Ethereum | 1 | ✅ Production | All features |
| Base | 8453 | ✅ Production | All features |
| Sepolia | 11155111 | ✅ Testnet | All features |
| Base Sepolia | 84532 | ✅ Testnet | All features |
| Localhost | 31337 | 🔧 Development | All features |

## 🎯 Airdrop Types

### 1. Batch Airdrops
- Direct token distribution to recipients
- Owner pays all gas costs
- Best for: < 500 recipients

### 2. Merkle Airdrops  
- Recipients claim using merkle proofs
- Cryptographically verified eligibility
- Best for: > 1000 recipients

### 3. Public Airdrops
- Anyone can claim (with conditions)
- No pre-defined recipient list
- Best for: Community building

## 🔐 Environment Configuration

### Contracts (.env)
```bash
# Network RPCs
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-key
BASE_RPC_URL=https://mainnet.base.org
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Deployment
PRIVATE_KEY=your_private_key_without_0x_prefix
ETHERSCAN_API_KEY=your_etherscan_key
BASESCAN_API_KEY=your_basescan_key

# Token Configuration
TOKEN_NAME=MyToken
TOKEN_SYMBOL=MTK
MAX_SUPPLY=1000000000
INITIAL_SUPPLY=200000000
```

### Frontend (.env.local)
```bash
# WalletConnect
NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id

# Contract Addresses (auto-populated after deployment)
NEXT_PUBLIC_TOKEN_ADDRESS_ETHEREUM=0x...
NEXT_PUBLIC_TOKEN_ADDRESS_BASE=0x...
NEXT_PUBLIC_BATCH_AIRDROP_ADDRESS=0x...
NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS=0x...
```

## 📚 Documentation

- **Contracts**: See `packages/contracts/README.md`
- **Frontend**: See `packages/frontend/README.md`
- **Guides**: 
  - `UNISWAP_GUIDE.md` - Liquidity management
  - `BRIDGE_GUIDE.md` - Cross-chain bridging  
  - `TREASURY_GUIDE.md` - Treasury operations
  - `CLAUDE.md` - Development workflow

## 🧪 Testing

### Contract Tests
```bash
cd packages/contracts
npm test                       # All tests
npx hardhat test               # Hardhat test runner
npm run coverage               # Coverage report
```

### Frontend Tests
```bash
cd packages/frontend  
npm test                       # Jest tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
```

## 🚀 Deployment Guide

### 1. Contract Deployment
```bash
# 1. Configure environment
cp packages/contracts/.env.example packages/contracts/.env
# Edit packages/contracts/.env

# 2. Deploy contracts
npm run deploy:sepolia         # Test deployment
npm run deploy:ethereum        # Production deployment

# 3. Export ABIs for frontend
cd packages/contracts
npm run export-abis
```

### 2. Frontend Deployment
```bash
# 1. Configure environment  
cp packages/frontend/.env.example packages/frontend/.env.local
# Edit packages/frontend/.env.local with contract addresses

# 2. Build and deploy
npm run build:frontend
# Deploy to Vercel, Netlify, or your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Workflow
1. Make changes in appropriate package
2. Run tests: `npm test`
3. Build: `npm run build`
4. Lint: `npm run lint` (in frontend package)
5. Commit with clear messages

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check package-specific READMEs
- **Issues**: Open GitHub issue with detailed description
- **Discord**: Join our community (link coming soon)

## 🔗 Links

- **Live Demo**: https://defi-token-suite.vercel.app (coming soon)
- **Contract Addresses**: See deployment files in `packages/contracts/deployments/`
- **Block Explorers**: 
  - [Ethereum](https://etherscan.io)
  - [Base](https://basescan.org)
  - [Sepolia](https://sepolia.etherscan.io)

---

**Built with ❤️ for the DeFi community**