const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Airdrop Contracts...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get token address from environment or command line
  const tokenAddress = process.env.TOKEN_ADDRESS || process.argv[2];
  const airdropType = process.env.AIRDROP_TYPE || process.argv[3] || "both";
  
  if (!tokenAddress) {
    throw new Error("Please provide TOKEN_ADDRESS");
  }
  
  console.log("Token address:", tokenAddress);
  console.log("Airdrop type:", airdropType);
  
  const deployments = {};
  
  // Deploy BatchAirdrop
  if (airdropType === "batch" || airdropType === "both") {
    console.log("\n1. Deploying BatchAirdrop...");
    const BatchAirdrop = await ethers.getContractFactory("BatchAirdrop");
    const batchAirdrop = await BatchAirdrop.deploy(tokenAddress, deployer.address);
    await batchAirdrop.waitForDeployment();
    
    const batchAddress = await batchAirdrop.getAddress();
    console.log("BatchAirdrop deployed to:", batchAddress);
    deployments.batchAirdrop = batchAddress;
  }
  
  // Deploy MerkleAirdrop
  if (airdropType === "merkle" || airdropType === "both") {
    console.log("\n2. Deploying MerkleAirdrop...");
    const MerkleAirdrop = await ethers.getContractFactory("MerkleAirdrop");
    const merkleAirdrop = await MerkleAirdrop.deploy(tokenAddress, deployer.address);
    await merkleAirdrop.waitForDeployment();
    
    const merkleAddress = await merkleAirdrop.getAddress();
    console.log("MerkleAirdrop deployed to:", merkleAddress);
    deployments.merkleAirdrop = merkleAddress;
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
  if (deployments.batchAirdrop) {
    console.log("BatchAirdrop:", deployments.batchAirdrop);
  }
  if (deployments.merkleAirdrop) {
    console.log("MerkleAirdrop:", deployments.merkleAirdrop);
  }
  
  // Write to deployment file
  const fs = require("fs");
  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }
  
  const filename = `deployments/${network.name}-airdrops.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to:", filename);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });