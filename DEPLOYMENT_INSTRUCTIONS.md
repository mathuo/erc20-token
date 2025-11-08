# 🚀 Deployment Instructions - Fixing "Ended" Campaigns

When you deploy your frontend from git, existing airdrops show as "ended" because they use old timestamps. Here's how to fix this:

## Problem
Your existing campaigns on Sepolia, Base Sepolia, and Hoodi were created with timestamps from when you first deployed them. When someone else deploys from your git repo, those campaigns appear "ended" because the end time has already passed.

## Solution: Refresh Existing Campaigns

### For Your Existing Networks:

Run these commands to create NEW campaigns with current timestamps:

```bash
cd packages/contracts

# Refresh Sepolia campaign (creates new 10-year campaign)
npm run refresh-campaign:sepolia

# Refresh Base Sepolia campaign  
npm run refresh-campaign:base-sepolia

# Refresh Hoodi campaign
npm run refresh-campaign:hoodi
```

Each command will:
✅ Create a NEW faucet campaign with current timestamp  
✅ 10-year duration (3650 days)  
✅ 50 MTK per claim  
✅ 24-hour cooldown  
✅ Save campaign info to a new file  

### For New Networks (Arbitrum/Optimism):

For networks you haven't deployed to yet:

```bash
# Complete deployment with working airdrop
npm run deploy-complete:arbitrum-sepolia
npm run deploy-complete:optimism-sepolia
```

## What Gets Created

After running refresh commands, you'll get:
- **New Campaign ID** (likely campaign #2, #3, etc.)
- **Current timestamps** (starts now, ends in 10 years)
- **Fresh claim records** saved to files like `sepolia-fresh-campaign-2.json`

## Frontend Updates

The frontend uses **Campaign ID 1** by default. After creating new campaigns, you have two options:

### Option 1: Update Frontend to Use New Campaign IDs
Update `packages/frontend/src/components/network/NetworkPageClient.tsx`:

```typescript
// Change this line:
const campaignId = BigInt(1);

// To use the new campaign ID from your refresh (e.g., campaign 2):
const campaignId = BigInt(2); // or whatever ID was created
```

### Option 2: Keep Using Campaign 1 (Simpler)
If you want to keep the frontend unchanged, you can create campaigns with specific timing by modifying the refresh script to target Campaign ID 1.

## Files to Commit

After refreshing campaigns, commit these files:

```bash
# New campaign files (commit these)
git add packages/contracts/*-fresh-campaign-*.json

# Updated deployment scripts (commit these)
git add packages/contracts/scripts/refreshCampaigns.js
git add packages/contracts/scripts/deployComplete.js
git add packages/contracts/package.json

# Deployment guide (commit this)
git add DEPLOYMENT_INSTRUCTIONS.md
```

## For New Deployments

Anyone deploying your project should:

1. **Clone the repo**
2. **Set up environment variables** (RPC URLs, private keys)
3. **Run refresh commands** for existing networks:
   ```bash
   npm run refresh-campaign:sepolia
   npm run refresh-campaign:base-sepolia
   npm run refresh-campaign:hoodi
   ```
4. **Deploy new networks** (if needed):
   ```bash
   npm run deploy-complete:arbitrum-sepolia
   npm run deploy-complete:optimism-sepolia
   ```

## Expected Output

```
🔄 Refreshing Campaign on sepolia
Airdrop Address: 0x001f2D4CEfC364CCe7B9db788f1C3Bb790Aff097

🚰 Creating Fresh Faucet Campaign...
✅ Campaign created!
Campaign ID: 2

📊 Campaign Info:
Active: true
Currently Active: true  
End Time: 05/11/2035, 22:45:30
Years remaining: 10

🎉 Campaign refresh complete!
✅ Users can now claim 50 MTK every 24 hours for 10 years!
```

This ensures that no matter when someone deploys your code, the airdrops will have fresh 10-year durations!