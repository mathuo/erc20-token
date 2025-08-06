# Claude Development Guide

This file contains information for Claude to understand the project structure, common tasks, and development workflows.

## Project Overview

This is a comprehensive DeFi token suite built on Hardhat with:
- ERC-20 token deployment on Ethereum and Base networks
- Uniswap V3 integration for liquidity management
- Cross-chain bridging capabilities
- Treasury management tools
- Advanced trading and monitoring scripts

## Key Commands

### Development Workflow
```bash
npm run compile        # Compile contracts
npm run test          # Run tests
```

### Token Deployment
```bash
npm run deploy:ethereum      # Deploy to Ethereum mainnet
npm run deploy:base         # Deploy to Base mainnet
npm run deploy:sepolia      # Deploy to Sepolia testnet
npm run deploy:base-sepolia # Deploy to Base Sepolia testnet
npm run deploy:localhost    # Deploy to local network
```

### Liquidity Management
```bash
npm run create-pool:base        # Create Uniswap V3 pool on Base
npm run create-pool:ethereum    # Create Uniswap V3 pool on Ethereum
npm run add-liquidity:base      # Add liquidity on Base
npm run add-liquidity:ethereum  # Add liquidity on Ethereum
npm run remove-liquidity:base   # Remove liquidity on Base
npm run remove-liquidity:ethereum # Remove liquidity on Ethereum
```

### Bridge Operations
```bash
npm run bridge-deposit   # Bridge from Ethereum to Base
npm run bridge-withdraw  # Bridge from Base to Ethereum
npm run bridge-status    # Check bridge transaction status
npm run bridge-finalize  # Finalize bridge transaction
```

### Treasury Management
```bash
npm run treasury  # Run treasury management operations
```

## File Structure

### Contracts
- `contracts/MyToken.sol` - Main ERC-20 token contract

### Scripts Directory
The `scripts/` directory contains numerous utility scripts:

#### Core Deployment
- `deploy.js` - Main deployment script for tokens

#### Uniswap V3 Integration
- `createPool.js` - Create new Uniswap V3 pools
- `addLiquidity.js` - Add liquidity to pools
- `addLiquidityFixed.js` - Add liquidity with fixed parameters
- `addMinimalLiquidity.js` - Add minimal liquidity for testing
- `addLiquidityCorrect.js` - Corrected liquidity addition
- `removeLiquidity.js` - Remove liquidity from pools
- `removeAllLiquidity.js` - Remove all liquidity positions
- `checkPoolLiquidity.js` - Check current pool liquidity
- `visualizePool.js` - Visualize pool state and positions
- `uniswapHelpers.js` - Utility functions for Uniswap operations

#### Trading and Swapping
- `simpleSwap.js` - Simple token swapping
- `swapInPool.js` - Execute swaps within pools
- `directPoolSwap.js` - Direct pool swap operations
- `testTrade.js` - Test trading functionality
- `executeProperSwap.js` - Execute proper swap transactions
- `finalSwapAttempt.js` - Final swap attempt script
- `deploySwapHelper.js` - Deploy swap helper contracts

#### Bridge Operations
- `bridgeDeposit.js` - Deposit tokens for bridging
- `bridgeWithdraw.js` - Withdraw tokens from bridge
- `bridgeStatus.js` - Check bridge transaction status
- `bridgeFinalize.js` - Finalize bridge transactions
- `bridgeHelpers.js` - Bridge utility functions

#### Monitoring and Analysis
- `checkCirculation.js` - Check token circulation
- `checkSepoliaBalance.js` - Check balances on Sepolia
- `compareNetworks.js` - Compare token data across networks
- `collectTokens.js` - Collect tokens from various sources

#### Treasury and Management
- `treasuryManager.js` - Treasury management operations

#### Debugging and Development
- `debugLiquidity.js` - Debug liquidity issues

## Environment Variables

The project uses extensive environment configuration. Key variables include:

### Network Configuration
- `ETHEREUM_RPC_URL` - Ethereum mainnet RPC endpoint
- `SEPOLIA_RPC_URL` - Sepolia testnet RPC endpoint
- `BASE_RPC_URL` - Base mainnet RPC endpoint
- `BASE_SEPOLIA_RPC_URL` - Base Sepolia testnet RPC endpoint

### Authentication
- `PRIVATE_KEY` - Deployment wallet private key (without 0x prefix)
- `ETHERSCAN_API_KEY` - Etherscan API key for contract verification
- `BASESCAN_API_KEY` - Basescan API key for contract verification

### Token Configuration
- `TOKEN_NAME` - Token name (default: MyToken)
- `TOKEN_SYMBOL` - Token symbol (default: MTK)
- `MAX_SUPPLY` - Maximum token supply
- `INITIAL_SUPPLY` - Initial token supply
- `TREASURY_ADDRESS` - Treasury wallet address
- `FEE_RECIPIENT` - Fee recipient address
- `INITIAL_OWNER` - Initial contract owner

### Uniswap Configuration
- `TOKEN_ADDRESS` - Token contract address
- `POOL_ADDRESS` - Uniswap V3 pool address
- `INITIAL_PRICE` - Initial token price
- `TOKEN_AMOUNT` - Amount of tokens for liquidity
- `ETH_AMOUNT` - Amount of ETH for liquidity
- `TOKEN_ID` - Position token ID
- `LIQUIDITY_PERCENTAGE` - Percentage of liquidity to manage

### Bridge Configuration
- `L1_TOKEN_ADDRESS` - Layer 1 (Ethereum) token address
- `L2_TOKEN_ADDRESS` - Layer 2 (Base) token address
- `BRIDGE_AMOUNT` - Amount to bridge
- `BRIDGE_RECIPIENT` - Bridge recipient address
- `BRIDGE_TX_HASH` - Transaction hash for monitoring
- `BRIDGE_NETWORK` - Bridge network configuration

### Additional Settings
- `REPORT_GAS` - Enable gas reporting (true/false)

## Dependencies

### Core Dependencies
- `@openzeppelin/contracts` - OpenZeppelin contract library
- `@uniswap/v3-core` - Uniswap V3 core contracts
- `@uniswap/v3-periphery` - Uniswap V3 periphery contracts
- `@uniswap/v3-sdk` - Uniswap V3 SDK
- `@uniswap/sdk-core` - Uniswap core SDK
- `dotenv` - Environment variable management
- `jsbi` - JavaScript big integer library

### Development Dependencies
- `@nomicfoundation/hardhat-toolbox` - Hardhat development tools
- `hardhat` - Ethereum development environment

## Common Tasks for Claude

### When deploying tokens:
1. Ensure `.env` file is configured with proper network RPC URLs and private key
2. Use appropriate deployment script: `npm run deploy:[network]`
3. Verify contracts are deployed and verified on block explorers

### When managing liquidity:
1. Ensure token is deployed and `TOKEN_ADDRESS` is set in `.env`
2. Create pool first if it doesn't exist: `npm run create-pool:[network]`
3. Add liquidity: `npm run add-liquidity:[network]`
4. Monitor positions with visualization scripts

### When bridging tokens:
1. Ensure both L1 and L2 token addresses are configured
2. Start with deposit: `npm run bridge-deposit`
3. Monitor status: `npm run bridge-status`
4. Complete with withdrawal or finalization as needed

### When troubleshooting:
1. Check network connectivity and RPC endpoints
2. Verify environment variables are properly set
3. Use monitoring scripts to check current state
4. Review transaction hashes and block explorer data

## Security Notes

- Never commit the actual `.env` file - use `.env.example` as template
- Private keys should never be hardcoded in scripts
- Always test on testnets before mainnet deployment
- Verify contracts on block explorers after deployment
- Use hardware wallets or multisig for production deployments