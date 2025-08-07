const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const fs = require("fs");

async function main() {
  console.log("Creating Merkle Airdrop Campaign...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Creating with account:", deployer.address);
  
  // Get parameters
  const merkleAirdropAddress = process.env.MERKLE_AIRDROP_ADDRESS || process.argv[2];
  const recipientsFile = process.env.RECIPIENTS_FILE || process.argv[3] || "merkle-recipients.json";
  const campaignName = process.env.CAMPAIGN_NAME || process.argv[4] || "Token Launch Airdrop";
  const durationDays = Number(process.env.DURATION_DAYS || process.argv[5] || "30");
  
  if (!merkleAirdropAddress) {
    throw new Error("Please provide MERKLE_AIRDROP_ADDRESS");
  }
  
  console.log("MerkleAirdrop contract:", merkleAirdropAddress);
  console.log("Recipients file:", recipientsFile);
  console.log("Campaign name:", campaignName);
  console.log("Duration:", durationDays, "days");
  
  // Load recipients
  let recipients;
  try {
    const recipientsData = fs.readFileSync(recipientsFile, "utf8");
    recipients = JSON.parse(recipientsData);
  } catch (error) {
    console.log("Recipients file not found, creating example...");
    
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
    
    fs.writeFileSync("merkle-recipients-example.json", JSON.stringify(exampleRecipients, null, 2));
    console.log("Created merkle-recipients-example.json");
    console.log("Please create your recipients file and run again");
    return;
  }
  
  console.log(`Loaded ${recipients.length} recipients`);
  
  // Validate recipients
  const leaves = [];
  let totalAmount = 0n;
  
  for (const recipient of recipients) {
    if (!ethers.isAddress(recipient.address)) {
      throw new Error(`Invalid address: ${recipient.address}`);
    }
    
    const amount = BigInt(recipient.amount);
    if (amount <= 0) {
      throw new Error(`Invalid amount for ${recipient.address}: ${recipient.amount}`);
    }
    
    // Create leaf: keccak256(address, amount)
    const leaf = ethers.solidityPackedKeccak256(
      ["address", "uint256"],
      [recipient.address, recipient.amount]
    );
    
    leaves.push(leaf);
    totalAmount += amount;
  }
  
  console.log("Total airdrop amount:", ethers.formatEther(totalAmount), "tokens");
  
  // Create merkle tree
  console.log("Generating merkle tree...");
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const merkleRoot = merkleTree.getHexRoot();
  
  console.log("Merkle root:", merkleRoot);
  
  // Get contract
  const merkleAirdrop = await ethers.getContractAt("MerkleAirdrop", merkleAirdropAddress);
  
  // Verify ownership
  const owner = await merkleAirdrop.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    throw new Error(`You are not the owner of this airdrop contract. Owner: ${owner}`);
  }
  
  // Create campaign
  console.log("Creating campaign...");
  const durationSeconds = durationDays * 24 * 60 * 60;
  
  const tx = await merkleAirdrop.createCampaign(
    campaignName,
    merkleRoot,
    totalAmount.toString(),
    durationSeconds
  );
  
  console.log("Transaction sent:", tx.hash);
  console.log("Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log("✅ Campaign created!");
  
  // Get campaign ID from events
  const campaignCreatedEvent = receipt.logs.find(
    log => log.fragment && log.fragment.name === "CampaignCreated"
  );
  
  const campaignId = campaignCreatedEvent ? campaignCreatedEvent.args[0] : null;
  console.log("Campaign ID:", campaignId ? campaignId.toString() : "Unknown");
  
  // Generate merkle proofs for all recipients
  console.log("Generating merkle proofs...");
  const proofs = {};
  
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const leaf = leaves[i];
    const proof = merkleTree.getHexProof(leaf);
    
    proofs[recipient.address] = {
      amount: recipient.amount,
      proof: proof,
      reason: recipient.reason || ""
    };
  }
  
  // Save campaign data
  const campaignData = {
    campaignId: campaignId ? campaignId.toString() : null,
    campaignName: campaignName,
    merkleRoot: merkleRoot,
    totalAmount: totalAmount.toString(),
    totalAmountFormatted: ethers.formatEther(totalAmount),
    recipients: recipients.length,
    durationDays: durationDays,
    contractAddress: merkleAirdropAddress,
    createdBy: deployer.address,
    createdAt: new Date().toISOString(),
    proofs: proofs
  };
  
  const filename = `merkle-campaign-${campaignId || Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(campaignData, null, 2));
  
  console.log("\n🎉 Merkle Airdrop Campaign Created!");
  console.log("Campaign ID:", campaignId ? campaignId.toString() : "Check contract events");
  console.log("Total recipients:", recipients.length);
  console.log("Total tokens:", ethers.formatEther(totalAmount));
  console.log("Duration:", durationDays, "days");
  console.log("Campaign data saved to:", filename);
  console.log("\n📋 Next Steps:");
  console.log("1. Share the campaign file with recipients");
  console.log("2. Recipients can claim using: npm run claim-merkle-airdrop");
  console.log("3. Monitor progress with: npm run merkle-airdrop-status");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });