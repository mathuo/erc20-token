# Airdrop Deployment Guide

This guide explains how to deploy complete airdrop functionality to any network.

## Quick Deploy (Recommended)

For a complete deployment with working airdrops:

```bash
# Deploy everything to Arbitrum Sepolia
npm run deploy-complete:arbitrum-sepolia

# Deploy everything to Optimism Sepolia  
npm run deploy-complete:optimism-sepolia
```

This single command will:
1. ✅ Deploy the token contract
2. ✅ Deploy the airdrop contract  
3. ✅ Create a 10-year faucet campaign (50 MTK every 24 hours)
4. ✅ Transfer token ownership to enable minting
5. ✅ Test the claim functionality
6. ✅ Save all deployment info

## What You Need

### Prerequisites
- Funded wallet with testnet ETH
- RPC URLs configured in `.env`
- API keys for contract verification (optional)

### Environment Variables
```bash
# Required
PRIVATE_KEY=your_private_key_without_0x_prefix
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
OPTIMISM_SEPOLIA_RPC_URL=https://sepolia.optimism.io

# Optional for verification
ARBISCAN_API_KEY=your_arbiscan_api_key
OPTIMISTIC_ETHERSCAN_API_KEY=your_optimistic_etherscan_api_key
```

## Manual Step-by-Step (Advanced)

If you need more control:

### 1. Deploy Contracts
```bash
# Deploy token and basic airdrop contracts
npm run deploy:arbitrum-sepolia
npm run deploy-public-airdrop -- [TOKEN_ADDRESS]
```

### 2. Create Campaign
```bash
# Create a new campaign with current timestamp
PUBLIC_AIRDROP_ADDRESS=[AIRDROP_ADDRESS] \
CAMPAIGN_TYPE=faucet \
CAMPAIGN_NAME="Permanent Token Faucet" \
CLAIM_AMOUNT=50000000000000000000 \
TOTAL_BUDGET=100000000000000000000000 \
DURATION_DAYS=3650 \
COOLDOWN_HOURS=24 \
MAX_CLAIMS_PER_USER=999999 \
npm run create-public-campaign -- --network arbitrum-sepolia
```

### 3. Transfer Ownership
```bash
# Enable the airdrop contract to mint tokens
hardhat run scripts/transferTokenOwnership.js --network arbitrum-sepolia
```

## Deployment Output

After successful deployment, you'll get:

```
🎉 DEPLOYMENT COMPLETE!
========================================
Network: arbitrum-sepolia (Chain ID: 421614)
Token Address: 0x...
Airdrop Address: 0x...
Campaign Duration: 3650 days (10 years)
Claim Amount: 50 MTK
Cooldown: 24 hours

🌐 Frontend URLs:
Local: http://localhost:3000/network/arbitrum-sepolia
Production: https://your-domain.com/network/arbitrum-sepolia

✅ Users can now claim 50 MTK every 24 hours for 10 years!
```

## Frontend Integration

After deployment, update your frontend's contract addresses:

### Option 1: Environment Variables
```bash
# In packages/frontend/.env.local
NEXT_PUBLIC_TOKEN_ADDRESS_ARBITRUM_SEPOLIA=0x...
NEXT_PUBLIC_PUBLIC_AIRDROP_ADDRESS_ARBITRUM_SEPOLIA=0x...
```

### Option 2: Direct Update
Update `packages/frontend/src/lib/contracts/addresses.ts`:

```typescript
421614: { // Arbitrum Sepolia
  MyToken: '0x...', // Your deployed token address
  PublicAirdrop: '0x...', // Your deployed airdrop address
},
```

## Common Issues

### "Campaign has ended"
- This happens when you deploy on a different network than where campaigns were created
- Solution: Use `deploy-complete` command which creates campaigns with current timestamps

### "Unable to estimate gas fee" (Coinbase Wallet)
- Already fixed in the frontend with explicit gas limits
- Arbitrum Sepolia: 500,000 gas
- Optimism Sepolia: 300,000 gas

### "Execution reverted" on claim
- Check if token ownership was transferred to airdrop contract
- Run: `hardhat run scripts/debugAirdrop.js --network [NETWORK]`

## Testing Deployment

Verify your deployment works:

```bash
# Test a claim
CAMPAIGN_ID=1 \
PUBLIC_AIRDROP_ADDRESS=[YOUR_AIRDROP_ADDRESS] \
hardhat run scripts/claimPublicAirdrop.js --network arbitrum-sepolia

# Debug any issues
hardhat run scripts/debugAirdrop.js --network arbitrum-sepolia
```

## Networks Supported

- ✅ Arbitrum Sepolia (421614)
- ✅ Optimism Sepolia (11155420)  
- ✅ Sepolia (11155111)
- ✅ Base Sepolia (84532)
- ✅ Hoodi Testnet (560048)

Add more networks by updating `hardhat.config.js` and the deployment scripts.