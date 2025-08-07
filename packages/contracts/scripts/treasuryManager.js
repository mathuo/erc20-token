const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  
  const command = process.argv[2];
  const tokenAddress = process.env.TOKEN_ADDRESS || process.argv[3];
  
  if (!tokenAddress) {
    throw new Error("Please provide TOKEN_ADDRESS");
  }
  
  const token = await ethers.getContractAt("MyToken", tokenAddress);
  
  console.log("Treasury Manager");
  console.log("Token:", tokenAddress);
  console.log("Signer:", signer.address);
  console.log("Command:", command);
  
  switch (command) {
    case "info":
      await showTreasuryInfo(token);
      break;
    case "set-treasury":
      await setTreasury(token, process.argv[4]);
      break;
    default:
      console.log("Available commands:");
      console.log("  info                    - Show treasury information");
      console.log("  set-treasury <address>  - Set new treasury address");
      break;
  }
}

async function showTreasuryInfo(token) {
  const treasury = await token.treasury();
  const owner = await token.owner();
  const totalSupply = await token.totalSupply();
  const treasuryBalance = await token.balanceOf(treasury);
  
  console.log("\n📊 Treasury Information:");
  console.log("Treasury Address:", treasury);
  console.log("Owner Address:", owner);
  console.log("Total Supply:", ethers.utils.formatEther(totalSupply));
  console.log("Treasury Balance:", ethers.utils.formatEther(treasuryBalance));
}

async function setTreasury(token, newTreasury) {
  if (!newTreasury) {
    throw new Error("Please provide new treasury address");
  }
  
  if (!ethers.utils.isAddress(newTreasury)) {
    throw new Error("Invalid treasury address");
  }
  
  console.log(`\n🔄 Setting treasury to: ${newTreasury}`);
  
  const tx = await token.setTreasury(newTreasury);
  console.log("Transaction submitted:", tx.hash);
  
  await tx.wait();
  console.log("✅ Treasury updated successfully");
  
  const updatedTreasury = await token.treasury();
  console.log("New treasury:", updatedTreasury);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });