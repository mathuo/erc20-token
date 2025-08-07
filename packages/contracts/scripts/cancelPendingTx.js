const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  const address = signer.address;
  
  console.log("Attempting to cancel pending transactions for:", address);
  
  // Get current state
  const balance = await ethers.provider.getBalance(address);
  const nonce = await ethers.provider.getTransactionCount(address, "latest");
  const pendingNonce = await ethers.provider.getTransactionCount(address, "pending");
  
  console.log("Current balance:", ethers.formatEther(balance), "ETH");
  console.log("Pending transactions:", pendingNonce - nonce);
  
  if (pendingNonce <= nonce) {
    console.log("✅ No pending transactions to cancel");
    return;
  }
  
  // Send a replacement transaction with higher gas price for the lowest pending nonce
  const replacementNonce = nonce;
  
  try {
    console.log(`\n🚫 Canceling transaction at nonce ${replacementNonce}...`);
    
    // Send 0 ETH to yourself with higher gas price to replace the stuck transaction
    const tx = await signer.sendTransaction({
      to: address,
      value: 0,
      nonce: replacementNonce,
      gasLimit: 21000, // Simple transfer gas limit
      gasPrice: ethers.parseUnits("2", "gwei") // Higher than current network price
    });
    
    console.log("Replacement transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Replacement transaction confirmed!");
    console.log("This should cancel/replace the stuck transaction");
    
    // Check new state
    const newNonce = await ethers.provider.getTransactionCount(address, "latest");
    const newPendingNonce = await ethers.provider.getTransactionCount(address, "pending");
    console.log("\nNew state:");
    console.log("Latest nonce:", newNonce);
    console.log("Pending nonce:", newPendingNonce);
    console.log("Remaining pending:", newPendingNonce - newNonce);
    
  } catch (error) {
    console.error("Failed to send replacement transaction:", error.message);
    console.log("\n💡 Alternative: Wait 30-60 minutes for transactions to drop naturally");
  }
}

main().catch(console.error);