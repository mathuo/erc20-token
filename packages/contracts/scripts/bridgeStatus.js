const { ethers } = require("hardhat");
const { getDepositStatus, getWithdrawalStatus } = require("./bridgeHelpers");

async function main() {
  const txHash = process.env.BRIDGE_TX_HASH || process.argv[2];
  const network = process.env.BRIDGE_NETWORK || process.argv[3] || "auto"; // auto, ethereum, base
  
  if (!txHash) {
    throw new Error("Please provide BRIDGE_TX_HASH");
  }
  
  console.log("Checking bridge status for transaction:", txHash);
  console.log("Network mode:", network);
  
  // Setup providers
  let l1Provider, l2Provider;
  
  if (network === "auto" || network === "ethereum") {
    // Try to detect network based on current connection
    const [signer] = await ethers.getSigners();
    const chainId = await signer.getChainId();
    
    if (chainId === 1 || chainId === 11155111) {
      // We're on Ethereum, check deposit status
      l1Provider = ethers.provider;
      
      // Setup Base provider for cross-check
      const baseRpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
      l2Provider = new ethers.providers.JsonRpcProvider(baseRpcUrl);
      
      console.log("Checking deposit status (Ethereum → Base)...");
      const status = await getDepositStatus(txHash, l1Provider, l2Provider);
      displayDepositStatus(status);
      
    } else if (chainId === 8453 || chainId === 84532) {
      // We're on Base, check withdrawal status
      l2Provider = ethers.provider;
      
      console.log("Checking withdrawal status (Base → Ethereum)...");
      const status = await getWithdrawalStatus(txHash, l2Provider);
      displayWithdrawalStatus(status);
      
    } else {
      throw new Error(`Unsupported network: ${chainId}. Please specify --network ethereum or --network base`);
    }
  } else if (network === "ethereum") {
    // Explicitly check deposit status
    l1Provider = ethers.provider;
    const baseRpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";
    l2Provider = new ethers.providers.JsonRpcProvider(baseRpcUrl);
    
    console.log("Checking deposit status (Ethereum → Base)...");
    const status = await getDepositStatus(txHash, l1Provider, l2Provider);
    displayDepositStatus(status);
    
  } else if (network === "base") {
    // Explicitly check withdrawal status
    l2Provider = ethers.provider;
    
    console.log("Checking withdrawal status (Base → Ethereum)...");
    const status = await getWithdrawalStatus(txHash, l2Provider);
    displayWithdrawalStatus(status);
    
  } else {
    throw new Error("Invalid network. Use 'ethereum', 'base', or 'auto'");
  }
}

function displayDepositStatus(status) {
  console.log("\n📋 Deposit Status Report");
  console.log("========================");
  console.log("Direction: Ethereum → Base");
  console.log("Status:", status.status.toUpperCase());
  console.log("Message:", status.message);
  
  switch (status.status) {
    case "not_found":
      console.log("\n❌ Transaction not found");
      console.log("- Verify the transaction hash is correct");
      console.log("- Ensure you're checking the right network");
      break;
      
    case "pending":
      console.log("\n⏳ Deposit pending confirmation");
      console.log("Blocks remaining:", status.blocksRemaining);
      console.log("Estimated completion:", status.eta?.toLocaleString());
      console.log("\n💡 Next steps:");
      console.log("- Wait for block confirmations");
      console.log("- Check again in a few minutes");
      break;
      
    case "ready":
      console.log("\n✅ Deposit ready on Base");
      console.log("Block number:", status.l1Receipt.blockNumber);
      console.log("\n💡 Next steps:");
      console.log("- Your tokens should be available on Base");
      console.log("- Check your Base wallet balance");
      break;
      
    case "error":
      console.log("\n❌ Error checking status");
      console.log("Error:", status.message);
      break;
  }
}

function displayWithdrawalStatus(status) {
  console.log("\n📋 Withdrawal Status Report");
  console.log("===========================");
  console.log("Direction: Base → Ethereum");
  console.log("Status:", status.status.toUpperCase());
  console.log("Message:", status.message);
  
  switch (status.status) {
    case "not_found":
      console.log("\n❌ Transaction not found");
      console.log("- Verify the transaction hash is correct");
      console.log("- Ensure you're checking the right network");
      break;
      
    case "initiated":
      console.log("\n⏳ Withdrawal in challenge period");
      console.log("Challenge ends:", status.challengeEndTime?.toLocaleString());
      console.log("Block number:", status.l2Receipt.blockNumber);
      
      const now = new Date();
      const timeRemaining = status.challengeEndTime - now;
      const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
      
      if (timeRemaining > 0) {
        console.log("Time remaining:", daysRemaining, "days");
        console.log("\n💡 Next steps:");
        console.log("- Wait for challenge period to end");
        console.log("- Run: npm run bridge-prove", process.argv[2] || "TX_HASH");
        console.log("- Then run: npm run bridge-finalize", process.argv[2] || "TX_HASH");
      } else {
        console.log("\n✅ Challenge period ended!");
        console.log("💡 Next steps:");
        console.log("- Prove withdrawal: npm run bridge-prove", process.argv[2] || "TX_HASH");
        console.log("- Finalize withdrawal: npm run bridge-finalize", process.argv[2] || "TX_HASH");
      }
      break;
      
    case "proven":
      console.log("\n✅ Withdrawal proven, ready to finalize");
      console.log("\n💡 Next steps:");
      console.log("- Finalize withdrawal: npm run bridge-finalize", process.argv[2] || "TX_HASH");
      break;
      
    case "finalized":
      console.log("\n🎉 Withdrawal completed!");
      console.log("- Your tokens are now available on Ethereum");
      break;
      
    case "error":
      console.log("\n❌ Error checking status");
      console.log("Error:", status.message);
      break;
  }
}

main()
  .then(() => {
    console.log("\n✨ Status check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });