const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 DEPLOYING SWAP HELPER CONTRACT");
  console.log("==================================");
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deploy SwapHelper
  const SwapHelper = await ethers.getContractFactory("SwapHelper");
  const swapHelper = await SwapHelper.deploy();

  await swapHelper.waitForDeployment();

  const swapHelperAddress = await swapHelper.getAddress();
  
  console.log("\n✅ SwapHelper deployed!");
  console.log("Contract address:", swapHelperAddress);
  console.log("Transaction hash:", swapHelper.deploymentTransaction().hash);
  
  console.log("\n📋 Contract Info:");
  console.log("- Network: Base Sepolia");
  console.log("- Contract: SwapHelper");
  console.log("- Purpose: Handle Uniswap V3 swap callbacks");
  
  console.log("\n🔗 View on BaseScan:");
  console.log(`https://sepolia.basescan.org/address/${swapHelperAddress}`);
  
  return swapHelperAddress;
}

main()
  .then((address) => {
    console.log("\n🎉 Deployment successful!");
    console.log("Use this address for swaps:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });