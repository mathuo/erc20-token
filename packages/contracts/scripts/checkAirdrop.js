const { ethers } = require("hardhat");

async function main() {
  const airdropAddress = "0x11C488580d296C0F4325bea230d9c225a048c6bA";
  
  const airdrop = await ethers.getContractAt("PublicAirdrop", airdropAddress);
  const tokenAddress = await airdrop.token();
  
  console.log("Airdrop contract:", airdropAddress);
  console.log("Token address:", tokenAddress);
  
  // Check if token exists
  try {
    const token = await ethers.getContractAt("MyToken", tokenAddress);
    const name = await token.name();
    const symbol = await token.symbol();
    const owner = await token.owner();
    console.log("Token name:", name);
    console.log("Token symbol:", symbol);  
    console.log("Token owner:", owner);
    console.log("Airdrop contract owner:", await airdrop.owner());
  } catch (error) {
    console.log("Error checking token:", error.message);
  }
}

main().catch(console.error);