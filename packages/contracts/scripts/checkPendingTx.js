const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  const address = signer.address;
  
  console.log("Checking pending transactions for:", address);
  
  try {
    // Get current balance
    const balance = await ethers.provider.getBalance(address);
    console.log("Current balance:", ethers.formatEther(balance), "ETH");
    
    // Get transaction count (nonce)
    const nonce = await ethers.provider.getTransactionCount(address, "latest");
    const pendingNonce = await ethers.provider.getTransactionCount(address, "pending");
    
    console.log("Latest nonce:", nonce);
    console.log("Pending nonce:", pendingNonce);
    console.log("Queued transactions:", pendingNonce - nonce);
    
    if (pendingNonce > nonce) {
      console.log("\n🔄 You have", pendingNonce - nonce, "pending transactions");
      console.log("Nonces", nonce, "to", pendingNonce - 1, "are pending");
      
      // Try to get details of pending transactions
      for (let i = nonce; i < pendingNonce; i++) {
        try {
          // This might not work with all RPC providers
          console.log(`\n📋 Checking nonce ${i}...`);
        } catch (error) {
          console.log(`Cannot get details for nonce ${i}`);
        }
      }
    } else {
      console.log("✅ No pending transactions");
    }
    
    // Check gas price
    const gasPrice = await ethers.provider.getFeeData();
    console.log("\n⛽ Current network gas price:");
    console.log("Gas price:", gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, "gwei") : "N/A", "gwei");
    console.log("Max fee:", gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, "gwei") : "N/A", "gwei");
    
  } catch (error) {
    console.error("Error checking transactions:", error.message);
  }
}

main().catch(console.error);