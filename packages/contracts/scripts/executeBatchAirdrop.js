const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Executing Batch Airdrop...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Executing with account:", deployer.address);
  
  // Get parameters
  const batchAirdropAddress = process.env.BATCH_AIRDROP_ADDRESS || process.argv[2];
  const recipientsFile = process.env.RECIPIENTS_FILE || process.argv[3] || "airdrop-recipients.json";
  
  if (!batchAirdropAddress) {
    throw new Error("Please provide BATCH_AIRDROP_ADDRESS");
  }
  
  console.log("BatchAirdrop contract:", batchAirdropAddress);
  console.log("Recipients file:", recipientsFile);
  
  // Load recipients
  let recipients;
  try {
    const recipientsData = fs.readFileSync(recipientsFile, "utf8");
    recipients = JSON.parse(recipientsData);
  } catch (error) {
    console.log("Recipients file not found, creating example...");
    
    // Create example recipients file
    const exampleRecipients = [
      {
        "address": "0x1234567890123456789012345678901234567890",
        "amount": "100000000000000000000", // 100 tokens in wei
        "reason": "Early supporter"
      },
      {
        "address": "0x0987654321098765432109876543210987654321", 
        "amount": "50000000000000000000", // 50 tokens in wei
        "reason": "Community contributor"
      }
    ];
    
    fs.writeFileSync("airdrop-recipients-example.json", JSON.stringify(exampleRecipients, null, 2));
    console.log("Created airdrop-recipients-example.json");
    console.log("Please create your recipients file and run again");
    return;
  }
  
  console.log(`Loaded ${recipients.length} recipients`);
  
  // Get contract
  const batchAirdrop = await ethers.getContractAt("BatchAirdrop", batchAirdropAddress);
  
  // Verify ownership
  const owner = await batchAirdrop.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    throw new Error(`You are not the owner of this airdrop contract. Owner: ${owner}`);
  }
  
  // Process recipients in batches of 100 (to avoid gas limits)
  const BATCH_SIZE = 100;
  const batches = [];
  
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    batches.push(batch);
  }
  
  console.log(`Processing ${batches.length} batches of up to ${BATCH_SIZE} recipients each`);
  
  let totalAmount = 0;
  let totalRecipients = 0;
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`\n📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} recipients)`);
    
    // Extract addresses and amounts
    const addresses = batch.map(r => r.address);
    const amounts = batch.map(r => r.amount);
    
    // Validate addresses
    for (const address of addresses) {
      if (!ethers.isAddress(address)) {
        throw new Error(`Invalid address: ${address}`);
      }
    }
    
    // Calculate batch total
    const batchTotal = amounts.reduce((sum, amount) => sum + BigInt(amount), 0n);
    console.log("Batch total:", ethers.formatEther(batchTotal), "tokens");
    
    try {
      // Execute batch airdrop
      const tx = await batchAirdrop.batchAirdrop(addresses, amounts, {
        gasLimit: 8000000 // Set high gas limit for batch operations
      });
      
      console.log("Transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log("✅ Batch completed!");
      console.log("Gas used:", receipt.gasUsed.toString());
      
      totalAmount += Number(ethers.formatEther(batchTotal));
      totalRecipients += batch.length;
      
      // Small delay between batches to avoid network congestion
      if (batchIndex < batches.length - 1) {
        console.log("Waiting 10 seconds before next batch...");
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
    } catch (error) {
      console.error(`❌ Batch ${batchIndex + 1} failed:`, error.message);
      
      // Save progress
      const progress = {
        completedBatches: batchIndex,
        totalBatches: batches.length,
        completedRecipients: totalRecipients,
        totalRecipients: recipients.length,
        distributedTokens: totalAmount,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      fs.writeFileSync("airdrop-progress.json", JSON.stringify(progress, null, 2));
      console.log("Progress saved to airdrop-progress.json");
      
      throw error;
    }
  }
  
  // Get final stats
  const stats = await batchAirdrop.getStats();
  
  console.log("\n🎉 Airdrop Complete!");
  console.log("Total recipients:", totalRecipients);
  console.log("Total tokens distributed:", totalAmount);
  console.log("Total campaigns:", stats.totalCampaigns.toString());
  console.log("Contract total distributed:", ethers.formatEther(stats.totalDistributed));
  
  // Save completion report
  const report = {
    completed: true,
    totalRecipients: totalRecipients,
    totalTokensDistributed: totalAmount,
    totalCampaigns: Number(stats.totalCampaigns),
    contractTotalDistributed: ethers.formatEther(stats.totalDistributed),
    executedBy: deployer.address,
    timestamp: new Date().toISOString(),
    contractAddress: batchAirdropAddress
  };
  
  fs.writeFileSync("airdrop-completion-report.json", JSON.stringify(report, null, 2));
  console.log("Completion report saved to airdrop-completion-report.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });