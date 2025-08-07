const { ethers } = require("hardhat");

async function main() {
  console.log("Creating Public Airdrop Campaign...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Creating with account:", deployer.address);
  
  // Get parameters
  const contractAddress = process.env.PUBLIC_AIRDROP_ADDRESS || process.argv[2];
  const campaignType = process.env.CAMPAIGN_TYPE || process.argv[3] || "simple";
  
  if (!contractAddress) {
    throw new Error("Please provide PUBLIC_AIRDROP_ADDRESS");
  }
  
  console.log("Contract address:", contractAddress);
  console.log("Campaign type:", campaignType);
  
  // Common parameters
  const campaignName = process.env.CAMPAIGN_NAME || "Public Token Claim";
  const claimAmount = process.env.CLAIM_AMOUNT || ethers.parseEther("100"); // 100 tokens
  const totalBudget = process.env.TOTAL_BUDGET || ethers.parseEther("10000"); // 10,000 tokens
  const durationDays = Number(process.env.DURATION_DAYS || "30");
  const durationSeconds = durationDays * 24 * 60 * 60;
  
  console.log("\n📋 Campaign Parameters:");
  console.log("Name:", campaignName);
  console.log("Claim Amount:", ethers.formatEther(claimAmount), "tokens");
  console.log("Total Budget:", ethers.formatEther(totalBudget), "tokens");
  console.log("Duration:", durationDays, "days");
  
  // Get contract
  let airdropContract;
  if (campaignType === "conditional") {
    airdropContract = await ethers.getContractAt("ConditionalAirdrop", contractAddress);
  } else {
    airdropContract = await ethers.getContractAt("PublicAirdrop", contractAddress);
  }
  
  // Verify ownership
  const owner = await airdropContract.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    throw new Error(`You are not the owner of this contract. Owner: ${owner}`);
  }
  
  let tx, campaignId;
  
  if (campaignType === "simple") {
    console.log("\n🚀 Creating Simple Campaign (one claim per user)...");
    
    tx = await airdropContract.createSimpleCampaign(
      campaignName,
      claimAmount,
      totalBudget,
      durationSeconds
    );
    
  } else if (campaignType === "faucet") {
    console.log("\n🚰 Creating Faucet Campaign (repeated claims)...");
    
    const cooldownHours = Number(process.env.COOLDOWN_HOURS || "24");
    const maxClaimsPerUser = Number(process.env.MAX_CLAIMS_PER_USER || "10");
    
    console.log("Cooldown:", cooldownHours, "hours");
    console.log("Max claims per user:", maxClaimsPerUser);
    
    tx = await airdropContract.createFaucetCampaign(
      campaignName,
      claimAmount,
      totalBudget,
      durationSeconds,
      cooldownHours,
      maxClaimsPerUser
    );
    
  } else if (campaignType === "conditional") {
    console.log("\n🔐 Creating Conditional Campaign (requirements must be met)...");
    
    tx = await airdropContract.createConditionalCampaign(
      campaignName,
      claimAmount,
      totalBudget,
      durationSeconds
    );
    
    console.log("⚠️  Remember to set claim conditions after campaign creation");
    
  } else if (campaignType === "holder") {
    console.log("\n💎 Creating Token Holder Campaign...");
    
    const requiredToken = process.env.REQUIRED_TOKEN || process.argv[4];
    const minimumBalance = process.env.MINIMUM_BALANCE || ethers.parseEther("1");
    
    if (!requiredToken) {
      throw new Error("Please provide REQUIRED_TOKEN address for holder campaign");
    }
    
    console.log("Required token:", requiredToken);
    console.log("Minimum balance:", ethers.formatEther(minimumBalance));
    
    tx = await airdropContract.createHolderOnlyAirdrop(
      campaignName,
      claimAmount,
      totalBudget,
      durationSeconds,
      requiredToken,
      minimumBalance
    );
    
  } else if (campaignType === "nft") {
    console.log("\n🖼️  Creating NFT Holder Campaign...");
    
    const nftContract = process.env.NFT_CONTRACT || process.argv[4];
    
    if (!nftContract) {
      throw new Error("Please provide NFT_CONTRACT address for NFT campaign");
    }
    
    console.log("Required NFT:", nftContract);
    
    tx = await airdropContract.createNFTHolderAirdrop(
      campaignName,
      claimAmount,
      totalBudget,
      durationSeconds,
      nftContract
    );
    
  } else {
    throw new Error(`Unknown campaign type: ${campaignType}`);
  }
  
  console.log("\nTransaction sent:", tx.hash);
  console.log("Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log("✅ Campaign created!");
  console.log("Gas used:", receipt.gasUsed.toString());
  
  // Extract campaign ID from events
  const campaignCreatedEvent = receipt.logs.find(
    log => log.fragment && log.fragment.name === "CampaignCreated"
  );
  
  if (campaignCreatedEvent) {
    campaignId = campaignCreatedEvent.args[0];
    console.log("Campaign ID:", campaignId.toString());
  }
  
  // Get campaign info
  if (campaignId) {
    console.log("\n📊 Campaign Info:");
    const info = await airdropContract.getCampaignInfo(campaignId);
    
    console.log("Name:", info.name);
    console.log("Claim Amount:", ethers.formatEther(info.claimAmount));
    console.log("Total Budget:", ethers.formatEther(info.totalBudget));
    console.log("Start Time:", new Date(Number(info.startTime) * 1000).toLocaleString());
    console.log("End Time:", new Date(Number(info.endTime) * 1000).toLocaleString());
    console.log("Cooldown Period:", Number(info.cooldownPeriod) / 3600, "hours");
    console.log("Max Claims Per User:", info.maxClaimsPerUser.toString());
    console.log("Is Active:", info.isCurrentlyActive);
  }
  
  // Save campaign info
  const campaignData = {
    campaignId: campaignId ? campaignId.toString() : null,
    campaignName: campaignName,
    campaignType: campaignType,
    claimAmount: claimAmount.toString(),
    totalBudget: totalBudget.toString(),
    claimAmountFormatted: ethers.formatEther(claimAmount),
    totalBudgetFormatted: ethers.formatEther(totalBudget),
    durationDays: durationDays,
    contractAddress: contractAddress,
    createdBy: deployer.address,
    createdAt: new Date().toISOString(),
    transactionHash: tx.hash,
    blockNumber: receipt.blockNumber
  };
  
  const filename = `public-campaign-${campaignId || Date.now()}.json`;
  const fs = require("fs");
  fs.writeFileSync(filename, JSON.stringify(campaignData, null, 2));
  
  console.log("\n🎉 Public Airdrop Campaign Created!");
  console.log("Campaign ID:", campaignId ? campaignId.toString() : "Check contract events");
  console.log("Total possible claims:", Number(totalBudget) / Number(claimAmount));
  console.log("Campaign data saved to:", filename);
  
  console.log("\n📋 Next Steps:");
  console.log("1. Share campaign ID with users:", campaignId ? campaignId.toString() : "TBD");
  console.log("2. Users can claim with: npm run claim-public-airdrop");
  console.log("3. Monitor progress with: npm run public-airdrop-status");
  
  if (campaignType === "conditional") {
    console.log("\n⚠️  Additional Setup Required:");
    console.log("Set claim conditions using the contract's setter functions");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });