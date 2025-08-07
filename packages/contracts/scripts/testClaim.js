const { ethers } = require("hardhat");

async function main() {
  const airdropAddress = "0x84ed9cFaBC7639bfd4e1771E71387e394e16762b";
  const tokenAddress = "0xCD868868d558e610091a249451ce95689038b421";
  const campaignId = 1;
  
  const [signer] = await ethers.getSigners();
  console.log("Testing with signer:", signer.address);
  
  const airdrop = await ethers.getContractAt("PublicAirdrop", airdropAddress);
  const token = await ethers.getContractAt("MyToken", tokenAddress);
  
  console.log("\n🔍 Contract Status:");
  console.log("Airdrop owner:", await airdrop.owner());
  console.log("Token owner:", await token.owner());
  console.log("Token total supply:", ethers.formatEther(await token.totalSupply()));
  
  console.log("\n🧪 Attempting actual claim...");
  try {
    const tx = await airdrop.claim(campaignId);
    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Claim successful!");
    console.log("Gas used:", receipt.gasUsed.toString());
  } catch (error) {
    console.log("❌ Claim failed:");
    console.log("Error reason:", error.reason || error.message);
    
    // Check if it's a revert with data
    if (error.data) {
      try {
        const decoded = airdrop.interface.parseError(error.data);
        console.log("Decoded error:", decoded.name, decoded.args);
      } catch (e) {
        console.log("Raw error data:", error.data);
      }
    }
  }
}

main().catch(console.error);