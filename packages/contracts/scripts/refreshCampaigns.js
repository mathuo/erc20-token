const { ethers } = require("hardhat");

// Network configuration mapping
const NETWORK_CONFIG = {
  'sepolia': {
    chainId: 11155111,
    airdropAddress: '0x001f2D4CEfC364CCe7B9db788f1C3Bb790Aff097',
    tokenAddress: '0x42128Ea03543239CFa813822F7C6c629112bB3a6'
  },
  'base-sepolia': {
    chainId: 84532,
    airdropAddress: '0x84ed9cFaBC7639bfd4e1771E71387e394e16762b',
    tokenAddress: '0xCD868868d558e610091a249451ce95689038b421'
  },
  'hoodi': {
    chainId: 560048,
    airdropAddress: '0xac1Ac1bd8d82531d97B86c40b5933DbDF1Fa91A1', 
    tokenAddress: '0xE41b45f227134A8cA5fd19CB2c263d27e0cE533B'
  }
};

async function main() {
  const networkName = hre.network.name;
  
  if (!NETWORK_CONFIG[networkName]) {
    throw new Error(`Network ${networkName} not configured. Supported: ${Object.keys(NETWORK_CONFIG).join(', ')}`);
  }
  
  const config = NETWORK_CONFIG[networkName];
  const [signer] = await ethers.getSigners();
  
  console.log("🔄 Refreshing Campaign on", networkName);
  console.log("Airdrop Address:", config.airdropAddress);
  console.log("Deployer:", signer.address);
  
  // Get airdrop contract
  const airdrop = await ethers.getContractAt("PublicAirdrop", config.airdropAddress);
  
  // Check ownership
  const owner = await airdrop.owner();
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(`You are not the owner. Owner: ${owner}, You: ${signer.address}`);
  }
  
  // Campaign parameters (matching existing campaigns)
  const campaignName = "Permanent Token Faucet";
  const claimAmount = ethers.parseEther("50"); // 50 MTK
  const totalBudget = ethers.parseEther("100000"); // 100k MTK
  const durationDays = 3650; // 10 years
  const durationSeconds = durationDays * 24 * 60 * 60;
  const cooldownHours = 24;
  const maxClaimsPerUser = 999999;
  
  console.log("\n📋 Campaign Parameters:");
  console.log("Name:", campaignName);
  console.log("Claim Amount:", ethers.formatEther(claimAmount), "MTK");
  console.log("Total Budget:", ethers.formatEther(totalBudget), "MTK");
  console.log("Duration:", durationDays, "days");
  console.log("Cooldown:", cooldownHours, "hours");
  
  console.log("\n🚰 Creating Fresh Faucet Campaign...");
  
  const tx = await airdrop.createFaucetCampaign(
    campaignName,
    claimAmount,
    totalBudget,
    durationSeconds,
    cooldownHours,
    maxClaimsPerUser
  );
  
  console.log("Transaction sent:", tx.hash);
  console.log("Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log("✅ Campaign created!");
  
  // Extract campaign ID from events
  let campaignId = null;
  for (const log of receipt.logs) {
    try {
      const parsedLog = airdrop.interface.parseLog(log);
      if (parsedLog.name === 'CampaignCreated') {
        campaignId = parsedLog.args[0];
        break;
      }
    } catch (e) {
      // Skip non-matching logs
    }
  }
  
  if (campaignId) {
    console.log("Campaign ID:", campaignId.toString());
    
    // Get campaign info to verify
    const info = await airdrop.getCampaignInfo(campaignId);
    console.log("\n📊 Campaign Info:");
    console.log("Active:", info.active);
    console.log("Currently Active:", info.isCurrentlyActive);
    console.log("End Time:", new Date(Number(info.endTime) * 1000).toLocaleString());
    console.log("Years remaining:", Math.round((Number(info.endTime) - Date.now()/1000) / (365*24*3600)));
    
    // Save campaign data
    const campaignData = {
      campaignId: campaignId.toString(),
      campaignName: campaignName,
      campaignType: "faucet",
      claimAmount: claimAmount.toString(),
      totalBudget: totalBudget.toString(),
      claimAmountFormatted: ethers.formatEther(claimAmount),
      totalBudgetFormatted: ethers.formatEther(totalBudget),
      durationDays: durationDays,
      cooldownHours: cooldownHours,
      maxClaimsPerUser: maxClaimsPerUser,
      contractAddress: config.airdropAddress,
      createdBy: signer.address,
      createdAt: new Date().toISOString(),
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      network: networkName,
      chainId: config.chainId
    };
    
    const fs = require("fs");
    const filename = `${networkName}-fresh-campaign-${campaignId}.json`;
    fs.writeFileSync(filename, JSON.stringify(campaignData, null, 2));
    console.log("\n💾 Campaign data saved to:", filename);
  }
  
  console.log("\n🎉 Campaign refresh complete!");
  console.log("✅ Users can now claim 50 MTK every 24 hours for 10 years!");
  
  // Test claim simulation
  console.log("\n🧪 Testing claim...");
  if (campaignId) {
    try {
      await airdrop.claim.staticCall(campaignId);
      console.log("✅ Claim test successful!");
    } catch (error) {
      console.log("❌ Claim test failed:", error.message);
      console.log("This might be normal if you already claimed recently");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });