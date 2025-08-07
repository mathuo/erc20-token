const { ethers } = require("hardhat");

async function main() {
  console.log("Claiming from Public Airdrop...");
  
  const [claimer] = await ethers.getSigners();
  console.log("Claiming with account:", claimer.address);
  
  // Get parameters
  const contractAddress = process.env.PUBLIC_AIRDROP_ADDRESS || process.argv[2];
  const campaignId = process.env.CAMPAIGN_ID || process.argv[3];
  
  if (!contractAddress) {
    throw new Error("Please provide PUBLIC_AIRDROP_ADDRESS");
  }
  
  if (!campaignId) {
    throw new Error("Please provide CAMPAIGN_ID");
  }
  
  console.log("Contract address:", contractAddress);
  console.log("Campaign ID:", campaignId);
  
  // Get contract (try both types)
  let airdropContract;
  try {
    airdropContract = await ethers.getContractAt("ConditionalAirdrop", contractAddress);
    // Test if it's actually a ConditionalAirdrop by calling a unique method
    await airdropContract.getConditionSettings();
    console.log("Using ConditionalAirdrop interface");
  } catch (error) {
    airdropContract = await ethers.getContractAt("PublicAirdrop", contractAddress);
    console.log("Using PublicAirdrop interface");
  }
  
  // Get campaign info
  console.log("\n📋 Fetching Campaign Info...");
  const campaignInfo = await airdropContract.getCampaignInfo(campaignId);
  
  console.log("Campaign Name:", campaignInfo.name);
  console.log("Claim Amount:", ethers.formatEther(campaignInfo.claimAmount));
  console.log("Total Budget:", ethers.formatEther(campaignInfo.totalBudget));
  console.log("Claimed So Far:", ethers.formatEther(campaignInfo.claimedAmount));
  console.log("Remaining:", ethers.formatEther(campaignInfo.remainingBudget));
  console.log("Progress:", `${((Number(campaignInfo.claimedAmount) / Number(campaignInfo.totalBudget)) * 100).toFixed(2)}%`);
  console.log("Start Time:", new Date(Number(campaignInfo.startTime) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(campaignInfo.endTime) * 1000).toLocaleString());
  console.log("Cooldown Period:", Number(campaignInfo.cooldownPeriod) / 3600, "hours");
  console.log("Max Claims Per User:", campaignInfo.maxClaimsPerUser.toString());
  console.log("Currently Active:", campaignInfo.isCurrentlyActive);
  
  if (!campaignInfo.isCurrentlyActive) {
    console.log("❌ Campaign is not currently active");
    return;
  }
  
  // Get user claim info
  console.log("\n👤 Your Claim Status:");
  const userInfo = await airdropContract.getUserClaimInfo(campaignId, claimer.address);
  
  console.log("Times Claimed:", userInfo.claimCount.toString());
  console.log("Total Claimed:", ethers.formatEther(userInfo.totalClaimed));
  console.log("Last Claim Time:", userInfo.lastClaimTime > 0 ? 
    new Date(Number(userInfo.lastClaimTime) * 1000).toLocaleString() : "Never");
  console.log("Can Claim Now:", userInfo.canClaimNow);
  console.log("Status:", userInfo.status);
  
  if (userInfo.nextClaimTime > 0) {
    console.log("Next Claim Available:", new Date(Number(userInfo.nextClaimTime) * 1000).toLocaleString());
  }
  
  if (!userInfo.canClaimNow) {
    console.log("❌ Cannot claim right now:", userInfo.status);
    
    // Show additional condition info for conditional airdrops
    try {
      const conditionCheck = await airdropContract.checkAllConditions(claimer.address);
      console.log("\n🔍 Condition Details:");
      console.log("Meets ETH Balance:", conditionCheck.meetsETHBalance);
      console.log("Is EOA:", conditionCheck.isEOA);
      console.log("Meets Account Age:", conditionCheck.meetsAccountAge);
      console.log("Owns Required NFT:", conditionCheck.ownsRequiredNFT);
      console.log("Meets Token Balances:", conditionCheck.meetsTokenBalances);
      console.log("Overall Result:", conditionCheck.overallResult);
      console.log("Failure Reason:", conditionCheck.failureReason);
    } catch (error) {
      // Not a conditional airdrop, skip condition details
    }
    
    return;
  }
  
  // Check token balance before claiming
  const tokenAddress = await airdropContract.token();
  const token = await ethers.getContractAt("MyToken", tokenAddress);
  const balanceBefore = await token.balanceOf(claimer.address);
  
  console.log("\n💰 Token Balance Before Claim:", ethers.formatEther(balanceBefore));
  
  // Attempt to claim
  console.log("\n🎯 Attempting to Claim Tokens...");
  console.log("Claim Amount:", ethers.formatEther(campaignInfo.claimAmount));
  
  try {
    const tx = await airdropContract.claim(campaignId);
    
    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Tokens claimed successfully!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Check new balance
    const balanceAfter = await token.balanceOf(claimer.address);
    const gained = balanceAfter - balanceBefore;
    
    console.log("Token Balance After Claim:", ethers.formatEther(balanceAfter));
    console.log("Tokens Gained:", ethers.formatEther(gained));
    
    // Get updated user info
    const updatedUserInfo = await airdropContract.getUserClaimInfo(campaignId, claimer.address);
    console.log("Total Claims Made:", updatedUserInfo.claimCount.toString());
    console.log("Total Ever Claimed:", ethers.formatEther(updatedUserInfo.totalClaimed));
    
    if (updatedUserInfo.nextClaimTime > 0) {
      console.log("Next Claim Available:", new Date(Number(updatedUserInfo.nextClaimTime) * 1000).toLocaleString());
    }
    
    // Save claim record
    const claimRecord = {
      campaignId: campaignId,
      claimant: claimer.address,
      amount: campaignInfo.claimAmount.toString(),
      amountFormatted: ethers.formatEther(campaignInfo.claimAmount),
      claimNumber: Number(updatedUserInfo.claimCount),
      totalClaimed: updatedUserInfo.totalClaimed.toString(),
      totalClaimedFormatted: ethers.formatEther(updatedUserInfo.totalClaimed),
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      claimedAt: new Date().toISOString()
    };
    
    const filename = `public-claim-${campaignId}-${claimer.address.slice(0,8)}-${Date.now()}.json`;
    const fs = require("fs");
    fs.writeFileSync(filename, JSON.stringify(claimRecord, null, 2));
    console.log("Claim record saved to:", filename);
    
  } catch (error) {
    console.error("❌ Claim failed:", error.message);
    
    // Parse common error messages
    if (error.message.includes("Campaign is not active")) {
      console.log("The campaign has been paused or is inactive");
    } else if (error.message.includes("Campaign has ended")) {
      console.log("The campaign time period has expired");
    } else if (error.message.includes("Campaign budget exhausted")) {
      console.log("All available tokens have been claimed");
    } else if (error.message.includes("Max claims per user reached")) {
      console.log("You have reached the maximum number of claims for this campaign");
    } else if (error.message.includes("Cooldown period not elapsed")) {
      console.log("You must wait longer between claims");
    } else if (error.message.includes("Does not meet claim conditions")) {
      console.log("You do not meet the requirements for this campaign");
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });