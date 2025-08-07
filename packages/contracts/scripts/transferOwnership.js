const { ethers } = require("hardhat");

async function main() {
  const tokenAddress = "0x0671e006DD31b41F4f76E7aC1Aa86baf6da5f473";
  const airdropAddress = "0xF97d918c3381da3D199F9f120985aDACF6D792C7";
  
  const [signer] = await ethers.getSigners();
  console.log("Transferring ownership with signer:", signer.address);
  
  const token = await ethers.getContractAt("MyToken", tokenAddress);
  
  console.log("Current token owner:", await token.owner());
  console.log("Transferring ownership to airdrop contract:", airdropAddress);
  
  const tx = await token.transferOwnership(airdropAddress);
  console.log("Transaction hash:", tx.hash);
  
  await tx.wait();
  console.log("✅ Ownership transferred!");
  console.log("New token owner:", await token.owner());
}

main().catch(console.error);