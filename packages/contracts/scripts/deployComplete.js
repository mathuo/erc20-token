const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Complete Airdrop Deployment for", hre.network.name);
  console.log("=" .repeat(60));
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient balance for deployment. Need at least 0.01 ETH");
  }

  // Step 1: Deploy Token
  console.log("\n📊 Step 1: Deploying Token Contract...");
  
  const tokenName = process.env.TOKEN_NAME || "MyToken";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "MTK";
  const maxSupply = process.env.MAX_SUPPLY || 1000000000;
  const initialSupply = process.env.INITIAL_SUPPLY || maxSupply * 0.2;
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  const initialOwner = deployer.address;
  
  const initialSupplyWei = ethers.parseEther(initialSupply.toString());

  const MyToken = await ethers.getContractFactory("MyToken");
  const token = await MyToken.deploy(tokenName, tokenSymbol, initialSupplyWei, initialOwner, treasuryAddress);
  await token.waitForDeployment();
  
  const tokenAddress = await token.getAddress();
  console.log("✅ Token deployed to:", tokenAddress);

  // Step 2: Deploy Airdrop Contracts
  console.log("\n🎯 Step 2: Deploying Airdrop Contracts...");
  
  const PublicAirdrop = await ethers.getContractFactory("PublicAirdrop");
  const publicAirdrop = await PublicAirdrop.deploy(tokenAddress, deployer.address);
  await publicAirdrop.waitForDeployment();
  
  const airdropAddress = await publicAirdrop.getAddress();
  console.log("✅ PublicAirdrop deployed to:", airdropAddress);

  // Step 3: Create Faucet Campaign
  console.log("\n🚰 Step 3: Creating Faucet Campaign...");
  
  const campaignName = "Permanent Token Faucet";
  const claimAmount = ethers.parseEther("50"); // 50 tokens
  const totalBudget = ethers.parseEther("100000"); // 100k tokens
  const durationDays = 3650; // 10 years
  const durationSeconds = durationDays * 24 * 60 * 60;
  const cooldownHours = 24;
  const maxClaimsPerUser = 999999;

  const campaignTx = await publicAirdrop.createFaucetCampaign(
    campaignName,
    claimAmount,
    totalBudget,
    durationSeconds,
    cooldownHours,
    maxClaimsPerUser
  );
  
  await campaignTx.wait();
  console.log("✅ Faucet campaign created with 10-year duration");

  // Step 4: Transfer Token Ownership
  console.log("\n🔄 Step 4: Transferring Token Ownership...");
  
  const transferTx = await token.transferOwnership(airdropAddress);
  await transferTx.wait();
  
  // Verify ownership transfer
  const newOwner = await token.owner();
  if (newOwner.toLowerCase() === airdropAddress.toLowerCase()) {
    console.log("✅ Token ownership transferred to airdrop contract");
  } else {
    throw new Error("Ownership transfer failed!");
  }

  // Step 5: Save Deployment Info
  console.log("\n💾 Step 5: Saving Deployment Information...");
  
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    tokenAddress: tokenAddress,
    airdropAddress: airdropAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    campaignInfo: {
      campaignId: "1",
      campaignName: campaignName,
      campaignType: "faucet",
      claimAmount: claimAmount.toString(),
      totalBudget: totalBudget.toString(),
      claimAmountFormatted: "50.0",
      totalBudgetFormatted: "100000.0",
      durationDays: durationDays,
      cooldownHours: cooldownHours,
      maxClaimsPerUser: maxClaimsPerUser
    }
  };

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }

  const filename = `deployments/${network.name}-complete-deployment.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));

  // Step 6: Test Claim
  console.log("\n🧪 Step 6: Testing Claim Functionality...");
  
  try {
    await publicAirdrop.claim.staticCall(1);
    console.log("✅ Claim test successful - airdrop is ready!");
  } catch (error) {
    console.log("❌ Claim test failed:", error.message);
  }

  // Final Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("Network:", network.name, `(Chain ID: ${Number(network.chainId)})`);
  console.log("Token Address:", tokenAddress);
  console.log("Airdrop Address:", airdropAddress);
  console.log("Campaign Duration:", durationDays, "days (10 years)");
  console.log("Claim Amount:", "50 MTK");
  console.log("Cooldown:", cooldownHours, "hours");
  console.log("Deployment Info Saved:", filename);
  console.log("\n🌐 Frontend URLs:");
  console.log(`Local: http://localhost:3000/network/${network.name}`);
  console.log(`Production: https://your-domain.com/network/${network.name}`);
  console.log("\n✅ Users can now claim 50 MTK every 24 hours for 10 years!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });