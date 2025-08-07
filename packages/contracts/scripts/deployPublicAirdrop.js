const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Public Airdrop Contracts...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get token address from environment or command line
  const tokenAddress = process.env.TOKEN_ADDRESS || process.argv[2];
  const contractType = process.env.PUBLIC_AIRDROP_TYPE || process.argv[3] || "both";
  
  if (!tokenAddress) {
    throw new Error("Please provide TOKEN_ADDRESS");
  }
  
  console.log("Token address:", tokenAddress);
  console.log("Contract type:", contractType);
  
  const deployments = {};
  
  // Deploy PublicAirdrop
  if (contractType === "simple" || contractType === "both") {
    console.log("\n1. Deploying PublicAirdrop...");
    const PublicAirdrop = await ethers.getContractFactory("PublicAirdrop");
    const publicAirdrop = await PublicAirdrop.deploy(tokenAddress, deployer.address);
    await publicAirdrop.waitForDeployment();
    
    const publicAddress = await publicAirdrop.getAddress();
    console.log("PublicAirdrop deployed to:", publicAddress);
    deployments.publicAirdrop = publicAddress;
  }
  
  // Deploy ConditionalAirdrop
  if (contractType === "conditional" || contractType === "both") {
    console.log("\n2. Deploying ConditionalAirdrop...");
    const ConditionalAirdrop = await ethers.getContractFactory("ConditionalAirdrop");
    const conditionalAirdrop = await ConditionalAirdrop.deploy(tokenAddress, deployer.address);
    await conditionalAirdrop.waitForDeployment();
    
    const conditionalAddress = await conditionalAirdrop.getAddress();
    console.log("ConditionalAirdrop deployed to:", conditionalAddress);
    deployments.conditionalAirdrop = conditionalAddress;
  }
  
  // Verify token ownership for minting permissions
  console.log("\n3. Checking token permissions...");
  const token = await ethers.getContractAt("MyToken", tokenAddress);
  const tokenOwner = await token.owner();
  
  if (tokenOwner.toLowerCase() === deployer.address.toLowerCase()) {
    console.log("✅ You own the token contract - airdrops can mint tokens");
  } else {
    console.log("⚠️  Warning: You don't own the token contract");
    console.log("   Token owner:", tokenOwner);
    console.log("   Your address:", deployer.address);
    console.log("   You'll need the token owner to transfer ownership or mint tokens manually");
  }
  
  // Save deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    tokenAddress: tokenAddress,
    deployments: deployments,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log("Network:", network.name);
  console.log("Chain ID:", Number(network.chainId));
  console.log("Token:", tokenAddress);
  if (deployments.publicAirdrop) {
    console.log("PublicAirdrop:", deployments.publicAirdrop);
  }
  if (deployments.conditionalAirdrop) {
    console.log("ConditionalAirdrop:", deployments.conditionalAirdrop);
  }
  
  // Write to deployment file
  const fs = require("fs");
  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }
  
  const filename = `deployments/${network.name}-public-airdrops.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", filename);

  console.log("\n🚀 Next Steps:");
  console.log("1. Create campaigns:");
  console.log("   npm run create-public-campaign");
  console.log("2. Users can claim:");
  console.log("   npm run claim-public-airdrop");
  console.log("3. Monitor status:");
  console.log("   npm run public-airdrop-status");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });