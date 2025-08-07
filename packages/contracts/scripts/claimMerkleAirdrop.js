const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Claiming Merkle Airdrop...");
  
  const [claimer] = await ethers.getSigners();
  console.log("Claiming with account:", claimer.address);
  
  // Get parameters
  const merkleAirdropAddress = process.env.MERKLE_AIRDROP_ADDRESS || process.argv[2];
  const campaignFile = process.env.CAMPAIGN_FILE || process.argv[3];
  const campaignId = process.env.CAMPAIGN_ID || process.argv[4];
  
  if (!merkleAirdropAddress) {
    throw new Error("Please provide MERKLE_AIRDROP_ADDRESS");
  }
  
  console.log("MerkleAirdrop contract:", merkleAirdropAddress);
  
  // Load campaign data
  let campaignData;
  if (campaignFile) {
    try {
      campaignData = JSON.parse(fs.readFileSync(campaignFile, "utf8"));
      console.log("Campaign loaded from file:", campaignFile);
    } catch (error) {
      throw new Error(`Could not load campaign file: ${campaignFile}`);
    }
  } else if (campaignId) {
    console.log("Using campaign ID:", campaignId);
    campaignData = { campaignId: campaignId };
  } else {
    throw new Error("Please provide CAMPAIGN_FILE or CAMPAIGN_ID");
  }
  
  const actualCampaignId = campaignData.campaignId || campaignId;
  if (!actualCampaignId) {
    throw new Error("Could not determine campaign ID");
  }
  
  console.log("Campaign ID:", actualCampaignId);
  
  // Get contract
  const merkleAirdrop = await ethers.getContractAt("MerkleAirdrop", merkleAirdropAddress);
  
  // Get campaign info
  console.log("Fetching campaign info...");
  const campaignInfo = await merkleAirdrop.getCampaignInfo(actualCampaignId);
  
  console.log("\n📋 Campaign Info:");
  console.log("Name:", campaignInfo.name);
  console.log("Total Amount:", ethers.formatEther(campaignInfo.totalAmount));
  console.log("Claimed Amount:", ethers.formatEther(campaignInfo.claimedAmount));
  console.log("Remaining Amount:", ethers.formatEther(campaignInfo.remainingAmount));
  console.log("Start Time:", new Date(Number(campaignInfo.startTime) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(campaignInfo.endTime) * 1000).toLocaleString());
  console.log("Is Active:", campaignInfo.isActive);
  
  if (!campaignInfo.isActive) {
    throw new Error("Campaign is not currently active");
  }
  
  // Check if already claimed
  const hasClaimed = await merkleAirdrop.checkClaimStatus(actualCampaignId, claimer.address);
  if (hasClaimed) {
    console.log("❌ You have already claimed tokens from this campaign");
    return;
  }
  
  // Get claim data
  let claimAmount, merkleProof;
  
  if (campaignData.proofs && campaignData.proofs[claimer.address]) {
    // From campaign file
    const claimData = campaignData.proofs[claimer.address];
    claimAmount = claimData.amount;
    merkleProof = claimData.proof;
    console.log("Claim data found in campaign file");
    console.log("Amount:", ethers.formatEther(claimAmount));
    console.log("Reason:", claimData.reason || "Not specified");
  } else {
    // Manual input
    claimAmount = process.env.CLAIM_AMOUNT || process.argv[5];
    const proofString = process.env.MERKLE_PROOF || process.argv[6];
    
    if (!claimAmount || !proofString) {
      console.log("❌ Claim data not found for your address in campaign file");
      console.log("Please provide CLAIM_AMOUNT and MERKLE_PROOF manually, or contact the campaign creator");
      return;
    }
    
    try {
      merkleProof = JSON.parse(proofString);
    } catch (error) {
      throw new Error("Invalid merkle proof format. Should be JSON array of strings");
    }
  }
  
  console.log("\n🎯 Claiming Tokens:");
  console.log("Your address:", claimer.address);
  console.log("Claim amount:", ethers.formatEther(claimAmount));
  
  try {
    // Execute claim
    const tx = await merkleAirdrop.claim(
      actualCampaignId,
      claimAmount,
      merkleProof
    );
    
    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Tokens claimed successfully!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Check token balance
    const tokenAddress = await merkleAirdrop.token();
    const token = await ethers.getContractAt("MyToken", tokenAddress);
    const balance = await token.balanceOf(claimer.address);
    
    console.log("Your token balance:", ethers.formatEther(balance));
    
    // Save claim record
    const claimRecord = {
      campaignId: actualCampaignId,
      claimant: claimer.address,
      amount: claimAmount,
      amountFormatted: ethers.formatEther(claimAmount),
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      claimedAt: new Date().toISOString()
    };
    
    const filename = `claim-${actualCampaignId}-${claimer.address.slice(0,8)}.json`;
    fs.writeFileSync(filename, JSON.stringify(claimRecord, null, 2));
    console.log("Claim record saved to:", filename);
    
  } catch (error) {
    if (error.message.includes("Invalid merkle proof")) {
      console.error("❌ Invalid merkle proof. You may not be eligible for this airdrop.");
    } else if (error.message.includes("Already claimed")) {
      console.error("❌ You have already claimed tokens from this campaign.");
    } else if (error.message.includes("Campaign has ended")) {
      console.error("❌ Campaign has ended. Claims are no longer accepted.");
    } else if (error.message.includes("Insufficient campaign balance")) {
      console.error("❌ Campaign has insufficient remaining balance.");
    } else {
      console.error("❌ Claim failed:", error.message);
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