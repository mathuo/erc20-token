const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());


  // Get deployment parameters
  const tokenName = process.env.TOKEN_NAME || "MyToken";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "MTK";
  const maxSupply = process.env.MAX_SUPPLY || 1000000000; // 1 billion default
  const initialSupply = process.env.INITIAL_SUPPLY || maxSupply * 0.2; // 20% of max supply default
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  const initialOwner = process.env.INITIAL_OWNER || deployer.address;
  
  // Convert to wei
  const initialSupplyWei = ethers.parseEther(initialSupply.toString());

  console.log("Token configuration:");
  console.log("Name:", tokenName);
  console.log("Symbol:", tokenSymbol);
  console.log("Max Supply:", maxSupply);
  console.log("Initial Supply:", initialSupply, `(${((initialSupply / maxSupply) * 100).toFixed(2)}% of max)`);
  console.log("Treasury:", treasuryAddress);
  console.log("Initial Owner:", initialOwner);

  const MyToken = await ethers.getContractFactory("MyToken");
  const token = await MyToken.deploy(tokenName, tokenSymbol, initialSupplyWei, initialOwner, treasuryAddress);

  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  const actualTotalSupply = await token.totalSupply();
  const maxSupplyFromContract = await token.MAX_SUPPLY();
  
  console.log("\n✅ Token deployed successfully!");
  console.log("Contract address:", tokenAddress);
  console.log("Token name:", await token.name());
  console.log("Token symbol:", await token.symbol());
  console.log("Current total supply:", ethers.formatEther(actualTotalSupply));
  console.log("Maximum supply:", ethers.formatEther(maxSupplyFromContract));
  console.log("Utilization:", `${((parseFloat(ethers.formatEther(actualTotalSupply)) / parseFloat(ethers.formatEther(maxSupplyFromContract))) * 100).toFixed(2)}%`);
  console.log("Owner:", await token.owner());
  console.log("Treasury:", await token.treasury());


  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: Number(await ethers.provider.getNetwork().then(n => n.chainId)),
    tokenAddress: tokenAddress,
    tokenName: tokenName,
    tokenSymbol: tokenSymbol,
    maxSupply: ethers.formatEther(maxSupplyFromContract),
    initialSupply: ethers.formatEther(actualTotalSupply),
    currentSupply: ethers.formatEther(actualTotalSupply),
    treasury: treasuryAddress,
    owner: initialOwner,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };

  const deploymentPath = path.join(__dirname, `../deployments/${network.name}-deployment.json`);
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📝 Deployment info saved to:", deploymentPath);

  // Verify contract on etherscan (if not localhost)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n🔍 Waiting for block confirmations...");
    await token.deploymentTransaction().wait(6);
    
    console.log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: tokenAddress,
        constructorArguments: [tokenName, tokenSymbol, initialSupplyWei, initialOwner, treasuryAddress],
      });
    } catch (e) {
      console.log("Error verifying contract:", e);
    }
  }

  return {
    tokenAddress,
    treasury: treasuryAddress,
    owner: initialOwner,
    currentSupply: ethers.formatEther(actualTotalSupply),
    maxSupply: ethers.formatEther(maxSupplyFromContract)
  };
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });