# Treasury & Token Allocation Guide

This guide explains how to deploy and manage tokens with treasury functionality, vesting schedules, and initial allocations.

## Overview

Your token contract includes:
- **Treasury Management**: Centralized treasury for token distribution
- **Vesting Schedules**: Time-locked allocations with cliff and vesting periods
- **Initial vs Maximum Supply**: Deploy with partial supply, mint more later
- **Allocation Categories**: Team, advisors, investors, community, treasury

## Key Features

### Supply Management
- **Maximum Supply**: 1 billion tokens (hard cap, cannot be exceeded)
- **Initial Supply**: 200 million tokens (20% of max, minted at deployment)
- **Expandable**: Owner can mint additional tokens up to maximum supply

### Treasury System
- All initial tokens minted to treasury address
- Treasury distributes tokens through allocations
- Vesting contract holds tokens until they vest
- Emergency withdrawal functions for recovery

### Vesting Mechanics
- **Cliff Period**: Time before any tokens become available
- **Linear Vesting**: Tokens vest gradually over time after cliff
- **Claiming**: Recipients claim their vested tokens manually
- **Revocation**: Owner can revoke unvested allocations

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Token Configuration
TOKEN_NAME=MyToken
TOKEN_SYMBOL=MTK
MAX_SUPPLY=1000000000          # 1 billion max supply
INITIAL_SUPPLY=200000000       # 200 million initial supply
TREASURY_ADDRESS=0x_treasury_address
INITIAL_OWNER=0x_owner_address

# For management commands
TOKEN_ADDRESS=0x_deployed_token_address
```

### Allocation Configuration

Edit `config/allocations.json` to customize token distribution:

```json
{
  "treasury": {
    "percentage": 40,
    "description": "Treasury for ecosystem development"
  },
  "team": {
    "percentage": 20,
    "cliff": 365,
    "vestingDuration": 1095,
    "recipients": [
      {
        "address": "0x_founder_address",
        "percentage": 50,
        "role": "Founder"
      }
    ]
  },
  "settings": {
    "totalSupply": 1000000000,
    "initialSupply": 200000000
  }
}
```

## Deployment

### Deploy with Treasury & Allocations

```bash
# 1. Configure allocation in config/allocations.json
# 2. Set environment variables
export TOKEN_NAME="MyAwesomeToken"
export TOKEN_SYMBOL="MAT"
export TREASURY_ADDRESS=0x_your_treasury_address

# 3. Deploy token
npm run deploy:ethereum
# or
npm run deploy:base

# 4. Save the deployed address
export TOKEN_ADDRESS=0x_deployed_token_address
```

The deployment will:
1. Deploy token with specified initial supply
2. Mint all tokens to treasury
3. Create vesting allocations from config
4. Save deployment info to `deployments/`

## Treasury Management

### View Treasury Status

```bash
# Show treasury info and all allocations
TOKEN_ADDRESS=0x_token_address npm run treasury info
```

### Create New Allocation

```bash
# Create allocation: recipient, amount, cliff_days, vesting_days
TOKEN_ADDRESS=0x_token_address npm run treasury create-allocation 0x_recipient 100000 180 730
```

### Revoke Allocation

```bash
# Revoke allocation (returns unvested tokens to treasury)
TOKEN_ADDRESS=0x_token_address npm run treasury revoke-allocation 0x_recipient
```

### Set New Treasury

```bash
# Change treasury address
TOKEN_ADDRESS=0x_token_address npm run treasury set-treasury 0x_new_treasury
```

### Emergency Withdrawal

```bash
# Emergency withdraw from vesting contract
TOKEN_ADDRESS=0x_token_address npm run treasury emergency-withdraw 1000
```

## Token Claiming

### Claim Your Tokens

Recipients can claim their vested tokens:

```bash
# Claim tokens for connected wallet
TOKEN_ADDRESS=0x_token_address npm run claim-tokens

# Check specific recipient
TOKEN_ADDRESS=0x_token_address RECIPIENT_ADDRESS=0x_address npm run claim-tokens
```

### Check Claimable Amount

The claim script shows:
- Total allocation
- Cliff and vesting timeline
- Currently vested amount
- Available to claim
- Vesting status (CLIFF/VESTING/COMPLETED)

## Allocation Reporting

### Generate Reports

```bash
# Console report
TOKEN_ADDRESS=0x_token_address npm run allocation-report

# JSON export
TOKEN_ADDRESS=0x_token_address npm run allocation-report json

# CSV export  
TOKEN_ADDRESS=0x_token_address npm run allocation-report csv
```

Reports include:
- Token supply information
- Allocation summary by category
- Individual vesting details
- Claiming status and progress

## Example Workflow

### Complete Token Launch

```bash
# 1. Deploy token with treasury
export TOKEN_NAME="DemoToken"
export TOKEN_SYMBOL="DEMO"
export TREASURY_ADDRESS=0x123...
npm run deploy:ethereum

# 2. Check deployment
export TOKEN_ADDRESS=0xabc...
npm run treasury info

# 3. Create additional allocations
npm run treasury create-allocation 0x_advisor 50000 90 365

# 4. Monitor allocations
npm run allocation-report

# 5. Recipients claim tokens
npm run claim-tokens
```

### Supply Management

```bash
# Check current vs max supply
npm run treasury info

# Mint additional tokens (if needed)
# This requires direct contract interaction or custom script
```

## Allocation Categories

### Default Distribution (from config/allocations.json)

- **Treasury (40%)**: Ecosystem development, partnerships, operations
- **Team (20%)**: Core team with 1-year cliff, 3-year vesting
- **Investors (25%)**: Investor allocation with 3-month cliff, 1-year vesting  
- **Advisors (5%)**: Advisor allocation with 6-month cliff, 2-year vesting
- **Community (10%)**: Community rewards with 4-year linear vesting

### Vesting Schedules

**Team Allocation:**
- Cliff: 365 days (1 year)
- Vesting: 1095 days (3 years)
- Linear vesting after cliff

**Investor Allocation:**
- Cliff: 90 days (3 months)  
- Vesting: 365 days (1 year)
- Linear vesting after cliff

**Advisor Allocation:**
- Cliff: 180 days (6 months)
- Vesting: 730 days (2 years)
- Linear vesting after cliff

## Security Features

### Access Control
- **Owner**: Can create/revoke allocations, set treasury, mint tokens
- **Treasury**: Receives initial supply and manages distribution
- **Recipients**: Can only claim their own vested tokens

### Safety Mechanisms
- Maximum supply cap (cannot be exceeded)
- Vesting contract prevents early token access
- Emergency withdrawal for recovery scenarios
- Revocation returns unvested tokens to treasury

### Audit Considerations
- ReentrancyGuard prevents reentrancy attacks
- OpenZeppelin battle-tested contracts
- Clear separation of concerns
- Comprehensive event logging

## Troubleshooting

### Common Issues

**"Insufficient treasury balance"**
- Treasury needs enough tokens for allocation
- Check treasury balance with `treasury info`

**"Allocation already exists"**
- Each address can only have one allocation
- Revoke existing allocation first

**"No tokens available to claim"**  
- Check if cliff period has passed
- Verify vesting has started
- Ensure allocation exists

**"Only treasury can call this function"**
- Some functions require treasury address as caller
- Check you're using correct wallet

### Monitoring

Regular checks to perform:
1. Monitor treasury balance
2. Track vesting progress
3. Generate periodic reports
4. Verify claim transactions
5. Check for revoked allocations

## Integration Examples

### Frontend Integration

```javascript
// Check user's allocation
const allocation = await token.getAllocationInfo(userAddress);
const claimable = await token.claimableAmount(userAddress);

// Claim tokens
if (claimable > 0) {
  const tx = await token.claimTokens();
  await tx.wait();
}
```

### Backend Monitoring

```javascript
// Monitor all allocations
const recipients = await token.getAllocationRecipients();
for (const recipient of recipients) {
  const info = await token.getAllocationInfo(recipient);
  // Store/process allocation data
}
```

## Best Practices

1. **Test on testnets first** before mainnet deployment
2. **Verify all addresses** in allocation config
3. **Use hardware wallets** for treasury and owner
4. **Regular monitoring** of vesting progress
5. **Clear communication** with token recipients
6. **Backup allocation data** and private keys
7. **Document any changes** to allocations
8. **Plan for tax implications** of vesting

## Advanced Features

### Custom Vesting Schedules

Modify allocation config for different vesting patterns:

```json
{
  "custom_category": {
    "percentage": 5,
    "cliff": 0,           // No cliff
    "vestingDuration": 0, // Immediate vesting
    "recipients": [...]
  }
}
```

### Multi-Treasury Setup

Deploy multiple tokens with different treasuries:

```bash
# Token 1 with Treasury A
TREASURY_ADDRESS=0xA npm run deploy:ethereum

# Token 2 with Treasury B  
TREASURY_ADDRESS=0xB npm run deploy:base
```

### Programmatic Management

Create custom scripts for bulk operations:

```javascript
// Bulk allocation creation
const allocations = [
  { recipient: "0x1", amount: "1000", cliff: 90, vesting: 365 },
  { recipient: "0x2", amount: "2000", cliff: 90, vesting: 365 }
];

for (const alloc of allocations) {
  await token.createAllocation(
    alloc.recipient,
    ethers.utils.parseEther(alloc.amount),
    alloc.cliff * 24 * 60 * 60,
    alloc.vesting * 24 * 60 * 60
  );
}
```