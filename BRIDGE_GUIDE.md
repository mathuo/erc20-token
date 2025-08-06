# Token Bridge Guide: Ethereum ↔ Base

This guide explains how to bridge your ERC-20 tokens between Ethereum and Base networks using the standard bridge contracts.

## Overview

Base uses the official Ethereum bridge infrastructure, allowing you to:
- **Deposit**: Move tokens from Ethereum to Base (~10-20 minutes)
- **Withdraw**: Move tokens from Base to Ethereum (~7 days)

## Prerequisites

1. Deploy your token on both networks (same contract, different addresses)
2. Ensure you have ETH for gas fees on both networks
3. Configure your `.env` file with token addresses

## Bridge Commands

### Deposit (Ethereum → Base)

Move tokens from Ethereum to Base:

```bash
# Method 1: Using environment variables
export L1_TOKEN_ADDRESS=0x_ethereum_token_address
export L2_TOKEN_ADDRESS=0x_base_token_address
export BRIDGE_AMOUNT=100
npm run bridge-deposit

# Method 2: Using command line arguments
npx hardhat run scripts/bridgeDeposit.js --network ethereum 0x_l1_token 0x_l2_token 100

# Method 3: With custom recipient
export BRIDGE_RECIPIENT=0x_different_address
npm run bridge-deposit
```

### Withdraw (Base → Ethereum)

Move tokens from Base to Ethereum:

```bash
# Method 1: Using environment variables
export L2_TOKEN_ADDRESS=0x_base_token_address
export BRIDGE_AMOUNT=100
npm run bridge-withdraw

# Method 2: Using command line arguments
npx hardhat run scripts/bridgeWithdraw.js --network base 0x_l2_token 100

# Method 3: With custom recipient
export BRIDGE_RECIPIENT=0x_different_address
npm run bridge-withdraw
```

### Monitor Bridge Status

Check the status of your bridge transactions:

```bash
# Method 1: Auto-detect network
export BRIDGE_TX_HASH=0x_transaction_hash
npm run bridge-status

# Method 2: Specify network explicitly
npx hardhat run scripts/bridgeStatus.js 0x_transaction_hash ethereum
npx hardhat run scripts/bridgeStatus.js 0x_transaction_hash base
```

### Finalize Withdrawals

For withdrawals, you need to finalize after the challenge period:

```bash
# Get finalization instructions
export WITHDRAWAL_TX_HASH=0x_withdrawal_transaction_hash
npm run bridge-finalize
```

## Bridge Process Details

### Deposits (Ethereum → Base)

1. **Approve** tokens for the bridge contract
2. **Deposit** tokens on Ethereum
3. **Wait** ~10-20 minutes for confirmation
4. **Receive** tokens on Base automatically

**Timeline**: ~10-20 minutes

### Withdrawals (Base → Ethereum)

1. **Approve** tokens for the bridge contract
2. **Initiate** withdrawal on Base
3. **Wait** 7 days for challenge period
4. **Prove** withdrawal (can be done via SDK or UI)
5. **Finalize** withdrawal on Ethereum

**Timeline**: ~7 days + finalization transaction

## Environment Variables

Add these to your `.env` file:

```bash
# Bridge Configuration
L1_TOKEN_ADDRESS=0x_your_ethereum_token_address
L2_TOKEN_ADDRESS=0x_your_base_token_address
BRIDGE_AMOUNT=100
BRIDGE_RECIPIENT=0x_recipient_address_optional
BRIDGE_TX_HASH=0x_transaction_hash_to_monitor
BRIDGE_NETWORK=auto  # auto, ethereum, base
```

## Gas Fees

### Deposits (Ethereum → Base)
- **Ethereum gas**: ~100,000-300,000 gas (varies by network congestion)
- **Base gas**: Automatically handled, minimal cost

### Withdrawals (Base → Ethereum)
- **Base gas**: ~200,000-400,000 gas (very low cost)
- **Ethereum gas**: ~100,000-200,000 gas for finalization (varies by congestion)

## Bridge Contract Addresses

The scripts automatically use the correct addresses based on network:

### Ethereum Mainnet
- **L1 Standard Bridge**: `0x3154Cf16ccdb4C6d922629664174b904d80F2C35`
- **L1 Cross Domain Messenger**: `0x866E82a600A1414e583f7F13623F1aC5d58b0Afa`

### Base Mainnet
- **L2 Standard Bridge**: `0x4200000000000000000000000000000000000010`
- **L2 Cross Domain Messenger**: `0x4200000000000000000000000000000000000007`

### Testnet Support
- **Sepolia** ↔ **Base Sepolia** bridging is also supported

## Step-by-Step Examples

### Example 1: Bridge 1000 tokens from Ethereum to Base

```bash
# 1. Set environment variables
export L1_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
export L2_TOKEN_ADDRESS=0x0987654321098765432109876543210987654321
export BRIDGE_AMOUNT=1000

# 2. Execute deposit (make sure you're on Ethereum network)
npm run bridge-deposit

# 3. Monitor status
export BRIDGE_TX_HASH=0x_returned_transaction_hash
npm run bridge-status

# 4. Wait ~15 minutes, then check Base wallet
```

### Example 2: Bridge 500 tokens from Base to Ethereum

```bash
# 1. Set environment variables
export L2_TOKEN_ADDRESS=0x0987654321098765432109876543210987654321
export BRIDGE_AMOUNT=500

# 2. Execute withdrawal (make sure you're on Base network)
npm run bridge-withdraw

# 3. Monitor status
export BRIDGE_TX_HASH=0x_returned_transaction_hash
npm run bridge-status

# 4. Wait 7 days, then finalize
export WITHDRAWAL_TX_HASH=0x_returned_transaction_hash
npm run bridge-finalize
```

## Security Considerations

### Deposits
- ✅ Relatively safe and automated
- ✅ Short confirmation time
- ⚠️ Ensure token addresses are correct

### Withdrawals
- ⚠️ 7-day challenge period for security
- ⚠️ Requires manual finalization
- ⚠️ Don't lose your withdrawal transaction hash
- ✅ Challenge period prevents malicious activity

## Troubleshooting

### Common Issues

**"Insufficient allowance"**
- The bridge contract needs approval to spend your tokens
- Scripts handle this automatically

**"Transaction not found"**
- Verify transaction hash is correct
- Ensure you're checking the right network
- Wait a few minutes for transaction propagation

**"Withdrawal not ready"**
- 7-day challenge period must pass completely
- Use `npm run bridge-status` to check timing

**"Finalization failed"**
- Ensure you're on Ethereum network for finalization
- Consider using Base Bridge UI: https://bridge.base.org
- May need to wait for finalization window

### Alternative Methods

If scripts fail, you can use:

1. **Base Bridge UI**: https://bridge.base.org
   - User-friendly interface
   - Handles proving and finalization
   - Connects to your wallet

2. **Base SDK** (for developers):
   ```bash
   npm install @eth-optimism/sdk
   ```
   - Full programmatic control
   - Handles complex finalization logic
   - Better for integration

## Advanced Usage

### Custom Gas Limits

Modify scripts to adjust gas limits:

```javascript
// In bridgeDeposit.js, modify:
const depositTx = await bridgeContract.depositERC20(
  l1TokenAddress,
  l2TokenAddress,
  amountWei,
  200000,  // L2 gas limit - increase if needed
  bridgeData,
  {
    gasLimit: 500000  // L1 gas limit - increase if needed
  }
);
```

### Batch Operations

Bridge multiple amounts by modifying scripts or calling multiple times with different amounts.

### Monitoring Integration

Use the bridge status functions to build monitoring dashboards:

```javascript
const { getDepositStatus } = require('./scripts/bridgeHelpers');

async function monitorDeposit(txHash) {
  const status = await getDepositStatus(txHash, l1Provider, l2Provider);
  // Handle status updates
}
```

## Resources

- **Base Documentation**: https://docs.base.org/tools/bridge
- **Base Bridge UI**: https://bridge.base.org
- **Optimism SDK**: https://github.com/ethereum-optimism/optimism/tree/develop/packages/sdk
- **Base Discord**: https://base.org/discord
- **Bridge Explorer**: Use Etherscan/BaseScan to track transactions

## Important Notes

1. **Always test on testnets first** (Sepolia ↔ Base Sepolia)
2. **Save transaction hashes** - you'll need them for withdrawals
3. **Monitor gas prices** - Ethereum fees can be high during congestion
4. **Double-check addresses** - wrong addresses can result in lost tokens
5. **Understand timing** - deposits are fast, withdrawals take 7+ days

## Support

If you encounter issues:
1. Check transaction status on Etherscan/BaseScan
2. Verify all addresses and amounts
3. Try the Base Bridge UI as an alternative
4. Join Base Discord for community support