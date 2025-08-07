const { ethers } = require("hardhat");

async function main() {
  const airdropAddress = "0x84ed9cFaBC7639bfd4e1771E71387e394e16762b";
  const campaignId = 1;
  
  // You'll need to provide the wallet address you're trying to claim with
  const userAddress = "0x3399a699573D5473E7c9600F93137CAa4162a6fc";
  
  console.log("Checking claim status for:", userAddress);
  console.log("Campaign ID:", campaignId);
  console.log("Airdrop contract:", airdropAddress);
  
  const airdrop = await ethers.getContractAt("PublicAirdrop", airdropAddress);
  
  // Get campaign info
  const campaignInfo = await airdrop.getCampaignInfo(campaignId);
  console.log("\n📊 Campaign Info:");
  console.log("Name:", campaignInfo.name);
  console.log("Claim Amount:", ethers.formatEther(campaignInfo.claimAmount));
  console.log("Total Budget:", ethers.formatEther(campaignInfo.totalBudget));
  console.log("Claimed Amount:", ethers.formatEther(campaignInfo.claimedAmount));
  console.log("Remaining Budget:", ethers.formatEther(campaignInfo.remainingBudget));
  console.log("Is Currently Active:", campaignInfo.isCurrentlyActive);
  
  // Get user claim info
  const userInfo = await airdrop.getUserClaimInfo(campaignId, userAddress);
  console.log("\n👤 User Claim Info:");
  console.log("Claim Count:", userInfo.claimCount.toString());
  console.log("Total Claimed:", ethers.formatEther(userInfo.totalClaimed));
  console.log("Can Claim Now:", userInfo.canClaimNow);
  console.log("Status:", userInfo.status);
  
  // Test if the claim would work
  console.log("\n🧪 Testing claim simulation...");
  try {
    // This will simulate the transaction without sending it
    await airdrop.claim.staticCall(campaignId, { from: userAddress });
    console.log("✅ Claim simulation successful - transaction should work");
  } catch (error) {
    console.log("❌ Claim simulation failed:");
    console.log("Error:", error.reason || error.message);
  }
}

main().catch(console.error);