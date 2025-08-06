# Uniswap V3 Liquidity Provider Guide

This guide explains how to use your token as a liquidity provider on Uniswap V3 on both Ethereum and Base networks.

## Overview

As a liquidity provider, you'll:
1. Create a Uniswap V3 pool for your token paired with WETH
2. Add liquidity to earn trading fees
3. Manage your position (add/remove liquidity)

## Step-by-Step Guide

### 1. Deploy Your Token

First, deploy your token on your chosen network:

```bash
# Deploy on Ethereum mainnet
npm run deploy:ethereum

# Deploy on Base mainnet  
npm run deploy:base
```

Save the deployed token address.

### 2. Create a Uniswap Pool

Create a new pool for your token paired with WETH:

#### On Ethereum Mainnet:
```bash
# Method 1: Using environment variables
export TOKEN_ADDRESS=0x_your_token_address
export INITIAL_PRICE=0.001  # 1 token = 0.001 ETH
npm run create-pool:ethereum

# Method 2: Using command line arguments
npx hardhat run scripts/createPool.js --network ethereum 0x_your_token_address
```

#### On Base Mainnet:
```bash
# Method 1: Using environment variables
export TOKEN_ADDRESS=0x_your_token_address
export INITIAL_PRICE=0.001  # 1 token = 0.001 ETH
npm run create-pool:base

# Method 2: Using command line arguments
npx hardhat run scripts/createPool.js --network base 0x_your_token_address
```

**Important:** The initial price determines the starting exchange rate. Set it carefully based on your token's intended value.

### 3. Add Liquidity

Add liquidity to start earning fees:

#### On Ethereum Mainnet:
```bash
# Method 1: Using environment variables
export TOKEN_ADDRESS=0x_your_token_address
export POOL_ADDRESS=0x_your_pool_address
export TOKEN_AMOUNT=1000  # Amount of tokens to provide
export ETH_AMOUNT=1       # Amount of ETH to provide
npm run add-liquidity:ethereum

# Method 2: Using command line arguments
npx hardhat run scripts/addLiquidity.js --network ethereum 0x_token_address 0x_pool_address 1000 1
```

#### On Base Mainnet:
```bash
# Method 1: Using environment variables
export TOKEN_ADDRESS=0x_your_token_address
export POOL_ADDRESS=0x_your_pool_address
export TOKEN_AMOUNT=1000  # Amount of tokens to provide
export ETH_AMOUNT=1       # Amount of ETH to provide
npm run add-liquidity:base

# Method 2: Using command line arguments
npx hardhat run scripts/addLiquidity.js --network base 0x_token_address 0x_pool_address 1000 1
```

This will:
- Wrap ETH to WETH if needed
- Approve token spending
- Create a liquidity position (NFT)
- Add your tokens and ETH to the pool

### 4. Remove Liquidity

Remove liquidity when needed:

#### On Ethereum Mainnet:
```bash
# Method 1: Remove 100% of liquidity
export TOKEN_ID=123  # Your position NFT ID
npm run remove-liquidity:ethereum

# Method 2: Remove partial liquidity (50%)
export TOKEN_ID=123
export LIQUIDITY_PERCENTAGE=50
npm run remove-liquidity:ethereum

# Method 3: Using command line
npx hardhat run scripts/removeLiquidity.js --network ethereum 123 50
```

#### On Base Mainnet:
```bash
# Method 1: Remove 100% of liquidity
export TOKEN_ID=123  # Your position NFT ID
npm run remove-liquidity:base

# Method 2: Remove partial liquidity (50%)
export TOKEN_ID=123
export LIQUIDITY_PERCENTAGE=50
npm run remove-liquidity:base

# Method 3: Using command line
npx hardhat run scripts/removeLiquidity.js --network base 123 50
```

## Environment Variables

Add these to your `.env` file:

```bash
# Required
TOKEN_ADDRESS=0x_your_deployed_token_address
POOL_ADDRESS=0x_your_pool_address_after_creation

# Pool Creation
INITIAL_PRICE=0.001  # Token price in ETH

# Liquidity Management
TOKEN_AMOUNT=1000    # Tokens to provide
ETH_AMOUNT=1         # ETH to provide
TOKEN_ID=123         # Position NFT ID (after adding liquidity)
LIQUIDITY_PERCENTAGE=100  # Percentage to remove (default 100%)
```

## Key Concepts

### Fee Tiers
- **0.01%** (100): For very stable pairs
- **0.05%** (500): For stable pairs
- **0.3%** (3000): **Default** - Most common
- **1%** (10000): For exotic pairs

### Price Ranges
- Liquidity is provided within a specific price range
- Default range: ±10% around current price
- Narrower ranges = higher capital efficiency but more management needed
- Wider ranges = lower capital efficiency but less management needed

### Concentrated Liquidity
- Unlike Uniswap V2, V3 allows concentrated liquidity
- You earn fees only when price is within your range
- Higher fees when price is in your range
- Risk of impermanent loss if price moves outside range

## Fee Earnings

As a liquidity provider, you earn:
- **Trading fees**: 0.3% (default) of each trade in your price range
- **Fees accumulate** in your position
- **Collect fees** using the remove liquidity script

## Risk Management

### Impermanent Loss
- Occurs when token prices change relative to each other
- More pronounced in V3 due to concentrated liquidity
- Consider wider price ranges for lower risk

### Price Range Management
- Monitor your position regularly
- If price moves outside your range, you stop earning fees
- Consider updating your position (remove old, create new)

## Monitoring Your Position

Check your position status:
1. Visit [Uniswap V3 App](https://app.uniswap.org/#/pools)
2. Connect your wallet
3. View your positions and accumulated fees

## Network Addresses

The scripts automatically detect the network and use the correct addresses:

### Ethereum Mainnet Addresses:
- **Factory**: `0x1F98431c8aD98523631AE4a59f267346ea31F984`
- **Position Manager**: `0xC36442b4a4522E871399CD717aBDD847Ab11FE88`
- **Swap Router**: `0xE592427A0AEce92De3Edee1F18E0157C05861564`
- **WETH**: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`

### Base Mainnet Addresses:
- **Factory**: `0x33128a8fC17869897dcE68Ed026d694621f6FDfD`
- **Position Manager**: `0x03a520b32C04BF3bEEf7BF5415b1D8E7F58eaF56`
- **Swap Router**: `0x2626664c2603336E57B271c5C0b26F421741e481`
- **WETH**: `0x4200000000000000000000000000000000000006`

### Supported Testnets:
- **Sepolia** (Ethereum testnet)
- **Base Sepolia** (Base testnet)

## Troubleshooting

### Common Issues

**"Pool already exists"**
- A pool for your token pair already exists
- Use the existing pool address instead of creating a new one

**"Insufficient balance"**
- Ensure you have enough tokens and ETH
- Account for gas fees

**"Slippage tolerance exceeded"**
- Market price moved during transaction
- Try again or increase slippage tolerance in the script

**"Position not found"**
- Verify the TOKEN_ID is correct
- Ensure you own the position NFT

### Getting Help

1. Check transaction hashes on block explorers:
   - Ethereum: [Etherscan](https://etherscan.io)
   - Base: [BaseScan](https://basescan.org)
2. Verify all addresses are correct
3. Ensure sufficient gas and token balances
4. Check network connectivity

### Gas Considerations

**Ethereum Mainnet:**
- Higher gas fees (typically 20-100+ gwei)
- More expensive liquidity operations
- Consider gas optimization strategies

**Base Mainnet:**
- Lower gas fees (typically <1 gwei)  
- More cost-effective for frequent operations
- Faster transaction confirmations

## Advanced Usage

### Custom Price Ranges
Modify `addLiquidity.js` to set custom tick ranges:

```javascript
// Example: ±5% range instead of ±10%
const { lowerTick, upperTick } = getTickRange(slot0.tick, tickSpacing, 5);
```

### Multiple Positions
Create multiple positions with different price ranges for better capital efficiency.

### Automated Management
Consider building automated scripts to:
- Rebalance positions when price moves
- Compound fees by reinvesting
- Alert when positions go out of range

## Security Notes

- Always test on Base Sepolia testnet first
- Never share your private key
- Use hardware wallets for large amounts
- Verify all contract addresses
- Start with small amounts to test the process