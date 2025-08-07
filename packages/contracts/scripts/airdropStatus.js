const { ethers } = require("hardhat");

async function main() {
  console.log("Airdrop Status Dashboard");
  console.log("=======================");
  
  const [user] = await ethers.getSigners();
  console.log("Checking status with account:", user.address);
  
  const batchAirdropAddress = process.env.BATCH_AIRDROP_ADDRESS;
  const merkleAirdropAddress = process.env.MERKLE_AIRDROP_ADDRESS;
  const campaignId = process.env.CAMPAIGN_ID;
  
  // Check Batch Airdrop Status
  if (batchAirdropAddress) {
    console.log("\n🚀 Batch Airdrop Status");
    console.log("Contract:", batchAirdropAddress);
    
    try {
      const batchAirdrop = await ethers.getContractAt("BatchAirdrop", batchAirdropAddress);
      const stats = await batchAirdrop.getStats();
      
      console.log("Total campaigns executed:", stats.totalCampaigns.toString());
      console.log("Total tokens distributed:", ethers.formatEther(stats.totalDistributed));
      console.log("Contract balance:", ethers.formatEther(stats.contractBalance));
      
    } catch (error) {
      console.log("❌ Error checking batch airdrop:", error.message);
    }
  }
  
  // Check Merkle Airdrop Status
  if (merkleAirdropAddress) {
    console.log("\n🌳 Merkle Airdrop Status");
    console.log("Contract:", merkleAirdropAddress);
    
    try {
      const merkleAirdrop = await ethers.getContractAt("MerkleAirdrop", merkleAirdropAddress);
      
      // Get active campaigns
      const activeCampaigns = await merkleAirdrop.getActiveCampaigns();
      console.log("Active campaigns:", activeCampaigns.length);
      
      if (activeCampaigns.length > 0) {
        console.log("\nActive Campaigns:");
        
        for (const campaignIdBN of activeCampaigns) {
          const cId = campaignIdBN.toString();
          const info = await merkleAirdrop.getCampaignInfo(cId);
          
          console.log(`\n📋 Campaign ${cId}: ${info.name}`);
          console.log("  Total Amount:", ethers.formatEther(info.totalAmount));
          console.log("  Claimed Amount:", ethers.formatEther(info.claimedAmount));
          console.log("  Remaining:", ethers.formatEther(info.remainingAmount));
          console.log("  Progress:", `${((Number(info.claimedAmount) / Number(info.totalAmount)) * 100).toFixed(2)}%`);
          console.log("  Ends:", new Date(Number(info.endTime) * 1000).toLocaleString());
          
          // Check user's claim status
          const hasUserClaimed = await merkleAirdrop.checkClaimStatus(cId, user.address);
          console.log("  Your status:", hasUserClaimed ? "✅ Claimed" : "⏳ Not claimed");
        }
      }
      
      // Check specific campaign if provided
      if (campaignId) {
        console.log(`\n🔍 Campaign ${campaignId} Details:`);
        try {
          const info = await merkleAirdrop.getCampaignInfo(campaignId);
          const hasUserClaimed = await merkleAirdrop.checkClaimStatus(campaignId, user.address);
          
          console.log("Name:", info.name);
          console.log("Merkle Root:", info.merkleRoot);
          console.log("Total Amount:", ethers.formatEther(info.totalAmount));
          console.log("Claimed Amount:", ethers.formatEther(info.claimedAmount));
          console.log("Remaining Amount:", ethers.formatEther(info.remainingAmount));
          console.log("Start Time:", new Date(Number(info.startTime) * 1000).toLocaleString());
          console.log("End Time:", new Date(Number(info.endTime) * 1000).toLocaleString());
          console.log("Active Status:", info.active);
          console.log("Currently Claimable:", info.isActive);
          console.log("Your Claim Status:", hasUserClaimed ? "✅ Claimed" : "⏳ Not claimed");
          
          if (info.isActive && !hasUserClaimed) {
            console.log("\n💡 You can claim tokens from this campaign!");
            console.log("Use: npm run claim-merkle-airdrop");
          }
          
        } catch (error) {
          console.log("❌ Campaign not found or error:", error.message);
        }
      }
      
    } catch (error) {
      console.log("❌ Error checking merkle airdrop:", error.message);
    }
  }
  
  // Token balance check
  const tokenAddress = process.env.TOKEN_ADDRESS;
  if (tokenAddress) {
    console.log("\n💰 Your Token Balance");
    try {
      const token = await ethers.getContractAt("MyToken", tokenAddress);
      const balance = await token.balanceOf(user.address);
      const symbol = await token.symbol();
      
      console.log("Token:", tokenAddress);
      console.log("Balance:", ethers.formatEther(balance), symbol);
      
    } catch (error) {
      console.log("❌ Error checking token balance:", error.message);
    }
  }
  
  console.log("\n📝 Environment Variables:");
  console.log("BATCH_AIRDROP_ADDRESS:", batchAirdropAddress || "Not set");
  console.log("MERKLE_AIRDROP_ADDRESS:", merkleAirdropAddress || "Not set");
  console.log("CAMPAIGN_ID:", campaignId || "Not set");
  console.log("TOKEN_ADDRESS:", tokenAddress || "Not set");
  
  console.log("\n📚 Available Commands:");
  console.log("npm run deploy-airdrop        - Deploy airdrop contracts");
  console.log("npm run batch-airdrop         - Execute batch airdrop");
  console.log("npm run create-merkle-airdrop - Create merkle campaign");
  console.log("npm run claim-merkle-airdrop  - Claim from merkle campaign");
  console.log("npm run airdrop-status        - This status check");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });