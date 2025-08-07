const { ethers } = require("hardhat");

async function main() {
  console.log("Public Airdrop Status Dashboard");
  console.log("===============================");
  
  const [user] = await ethers.getSigners();
  console.log("Checking status with account:", user.address);
  
  const contractAddress = process.env.PUBLIC_AIRDROP_ADDRESS || process.argv[2];
  const specificCampaignId = process.env.CAMPAIGN_ID || process.argv[3];
  
  if (!contractAddress) {
    console.log("❌ Please provide PUBLIC_AIRDROP_ADDRESS");
    console.log("Usage: PUBLIC_AIRDROP_ADDRESS=0x... npm run public-airdrop-status");
    return;
  }
  
  console.log("Contract address:", contractAddress);
  
  // Determine contract type and get interface
  let airdropContract;
  let isConditional = false;
  
  try {
    airdropContract = await ethers.getContractAt("ConditionalAirdrop", contractAddress);
    // Test if it's actually a ConditionalAirdrop
    await airdropContract.getConditionSettings();
    isConditional = true;
    console.log("Contract type: ConditionalAirdrop");
  } catch (error) {
    airdropContract = await ethers.getContractAt("PublicAirdrop", contractAddress);
    console.log("Contract type: PublicAirdrop");
  }
  
  try {
    // Get active campaigns
    console.log("\n🚀 Active Campaigns:");
    const activeCampaigns = await airdropContract.getActiveCampaigns();
    
    if (activeCampaigns.length === 0) {
      console.log("No active campaigns found");
    } else {
      console.log(`Found ${activeCampaigns.length} active campaign(s)`);
      
      for (const campaignIdBN of activeCampaigns) {
        const cId = campaignIdBN.toString();
        await displayCampaignInfo(airdropContract, cId, user.address);
      }
    }
    
    // Show specific campaign if requested
    if (specificCampaignId && !activeCampaigns.map(c => c.toString()).includes(specificCampaignId)) {
      console.log(`\n🔍 Specific Campaign ${specificCampaignId} (Inactive):`);
      await displayCampaignInfo(airdropContract, specificCampaignId, user.address);
    }
    
    // Show condition settings for conditional airdrops
    if (isConditional) {
      console.log("\n🔐 Claim Conditions:");
      try {
        const conditions = await airdropContract.getConditionSettings();
        console.log("Minimum ETH Balance:", ethers.formatEther(conditions.minETHBalance));
        console.log("Minimum Account Age:", Number(conditions.minAccountAge) / (24 * 3600), "days");
        console.log("Requires EOA:", conditions.requiresEOA);
        console.log("Whitelisted NFT Count:", conditions.whitelistedNFTCount.toString());
        console.log("Token Requirements Count:", conditions.tokenRequirementCount.toString());
        
        // Check user's condition status
        console.log("\n👤 Your Condition Status:");
        const userConditions = await airdropContract.checkAllConditions(user.address);
        console.log("Meets ETH Balance:", userConditions.meetsETHBalance ? "✅" : "❌");
        console.log("Is EOA:", userConditions.isEOA ? "✅" : "❌");
        console.log("Meets Account Age:", userConditions.meetsAccountAge ? "✅" : "❌");
        console.log("Owns Required NFT:", userConditions.ownsRequiredNFT ? "✅" : "❌");
        console.log("Meets Token Balances:", userConditions.meetsTokenBalances ? "✅" : "❌");
        console.log("Overall Eligible:", userConditions.overallResult ? "✅" : "❌");
        
        if (!userConditions.overallResult) {
          console.log("Failure Reason:", userConditions.failureReason);
        }
        
        // Account age info
        const accountAge = await airdropContract.getUserAccountAge(user.address);
        if (accountAge > 0) {
          console.log("Your Account Age:", Number(accountAge) / (24 * 3600), "days");
        } else {
          console.log("Your Account Age: Not set (may need to be registered)");
        }
        
      } catch (error) {
        console.log("Could not fetch condition settings:", error.message);
      }
    }
    
    // Token balance
    console.log("\n💰 Your Token Balance:");
    const tokenAddress = await airdropContract.token();
    const token = await ethers.getContractAt("MyToken", tokenAddress);
    const balance = await token.balanceOf(user.address);
    const symbol = await token.symbol();
    
    console.log("Token Address:", tokenAddress);
    console.log("Balance:", ethers.formatEther(balance), symbol);
    
    // Overall stats
    console.log("\n📊 Overall Statistics:");
    let totalCampaigns = 0;
    let totalBudget = 0n;
    let totalClaimed = 0n;
    
    // This is a simple approach - in practice you'd track this more efficiently
    for (let i = 1; i <= 10; i++) { // Check first 10 campaigns
      try {
        const info = await airdropContract.getCampaignInfo(i);
        if (info.name) {
          totalCampaigns++;
          totalBudget += info.totalBudget;
          totalClaimed += info.claimedAmount;
        }
      } catch (error) {
        // Campaign doesn't exist, stop checking
        break;
      }
    }
    
    console.log("Total Campaigns:", totalCampaigns);
    console.log("Total Budget:", ethers.formatEther(totalBudget));
    console.log("Total Claimed:", ethers.formatEther(totalClaimed));
    if (totalBudget > 0n) {
      console.log("Overall Progress:", `${((Number(totalClaimed) / Number(totalBudget)) * 100).toFixed(2)}%`);
    }
    
  } catch (error) {
    console.error("❌ Error checking airdrop status:", error.message);
  }
  
  console.log("\n📚 Available Commands:");
  console.log("npm run deploy-public-airdrop    - Deploy public airdrop contracts");
  console.log("npm run create-public-campaign   - Create new campaign");
  console.log("npm run claim-public-airdrop     - Claim tokens from campaign");
  console.log("npm run public-airdrop-status    - This status dashboard");
  
  console.log("\n💡 Example Usage:");
  console.log("PUBLIC_AIRDROP_ADDRESS=0x... CAMPAIGN_ID=1 npm run claim-public-airdrop");
  console.log("CAMPAIGN_TYPE=faucet CLAIM_AMOUNT=50 npm run create-public-campaign");
}

async function displayCampaignInfo(contract, campaignId, userAddress) {
  try {
    const info = await contract.getCampaignInfo(campaignId);
    const userInfo = await contract.getUserClaimInfo(campaignId, userAddress);
    
    console.log(`\n📋 Campaign ${campaignId}: ${info.name}`);
    console.log("  Claim Amount:", ethers.formatEther(info.claimAmount));
    console.log("  Total Budget:", ethers.formatEther(info.totalBudget));
    console.log("  Claimed:", ethers.formatEther(info.claimedAmount));
    console.log("  Remaining:", ethers.formatEther(info.remainingBudget));
    console.log("  Progress:", `${((Number(info.claimedAmount) / Number(info.totalBudget)) * 100).toFixed(2)}%`);
    console.log("  Start:", new Date(Number(info.startTime) * 1000).toLocaleString());
    console.log("  End:", new Date(Number(info.endTime) * 1000).toLocaleString());
    
    if (Number(info.cooldownPeriod) > 0) {
      console.log("  Cooldown:", Number(info.cooldownPeriod) / 3600, "hours");
    }
    
    if (Number(info.maxClaimsPerUser) > 0) {
      console.log("  Max Claims Per User:", info.maxClaimsPerUser.toString());
    }
    
    console.log("  Status:", info.isCurrentlyActive ? "🟢 ACTIVE" : "🔴 INACTIVE");
    
    // User-specific info
    console.log("  Your Claims:", userInfo.claimCount.toString());
    console.log("  Your Total Claimed:", ethers.formatEther(userInfo.totalClaimed));
    console.log("  Can Claim Now:", userInfo.canClaimNow ? "✅ YES" : "❌ NO");
    
    if (!userInfo.canClaimNow) {
      console.log("  Reason:", userInfo.status);
    }
    
    if (userInfo.nextClaimTime > 0) {
      console.log("  Next Claim:", new Date(Number(userInfo.nextClaimTime) * 1000).toLocaleString());
    }
    
  } catch (error) {
    console.log(`Campaign ${campaignId}: ❌ Error - ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });