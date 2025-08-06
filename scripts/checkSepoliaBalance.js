const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(signer.address);
  
  console.log("💰 SEPOLIA BALANCE CHECK");
  console.log("=======================");
  console.log("Address:", signer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("Balance in wei:", balance.toString());
  
  const requiredForPool = ethers.parseEther("0.01"); // Estimate
  const hasEnough = balance >= requiredForPool;
  
  console.log("");
  console.log("Required (estimate):", ethers.formatEther(requiredForPool), "ETH");
  console.log("Have enough:", hasEnough ? "✅ YES" : "❌ NO");
  
  if (!hasEnough) {
    console.log("");
    console.log("💡 GET MORE SEPOLIA ETH:");
    console.log("1. Sepolia Faucet: https://faucets.chain.link/sepolia");
    console.log("2. Alchemy Faucet: https://sepoliafaucet.com/");
    console.log("3. Paradigm Faucet: https://faucet.paradigm.xyz/");
  }
}

main().catch(console.error);