const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying MyToken contract...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const tokenName = process.env.TOKEN_NAME || "MyToken";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "MTK";  
  const maxSupply = ethers.parseEther(process.env.MAX_SUPPLY || "1000000000");
  const initialSupply = ethers.parseEther(process.env.INITIAL_SUPPLY || "200000000");
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  const initialOwner = process.env.INITIAL_OWNER || deployer.address;

  console.log("Token configuration:");
  console.log("Name:", tokenName);
  console.log("Symbol:", tokenSymbol);
  console.log("Initial Supply:", ethers.formatEther(initialSupply));
  console.log("Treasury:", treasuryAddress);
  console.log("Initial Owner:", initialOwner);

  const MyToken = await ethers.getContractFactory("MyToken");
  const token = await MyToken.deploy(tokenName, tokenSymbol, initialSupply, initialOwner, treasuryAddress);

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  
  console.log("\n✅ Token deployed successfully!");
  console.log("Contract address:", tokenAddress);
  
  return tokenAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });