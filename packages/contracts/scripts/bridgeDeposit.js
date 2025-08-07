const { ethers } = require("hardhat");
const { 
  getBridgeAddresses, 
  calculateDepositETA,
  L1_STANDARD_BRIDGE_ABI 
} = require("./bridgeHelpers");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Bridging tokens from Ethereum to Base");
  console.log("Account:", deployer.address);
  
  // Get network chain ID to ensure we're on Ethereum
  const chainId = await deployer.getChainId();
  if (chainId !== 1 && chainId !== 11155111) { // Mainnet or Sepolia
    throw new Error("This script must be run on Ethereum network");
  }
  
  console.log("Network:", chainId === 1 ? "Ethereum Mainnet" : "Sepolia Testnet");
  
  // Get parameters
  const l1TokenAddress = process.env.L1_TOKEN_ADDRESS || process.argv[2];
  const l2TokenAddress = process.env.L2_TOKEN_ADDRESS || process.argv[3];
  const amount = process.env.BRIDGE_AMOUNT || process.argv[4];
  const recipient = process.env.BRIDGE_RECIPIENT || process.argv[5] || deployer.address;
  
  if (!l1TokenAddress || !l2TokenAddress || !amount) {
    throw new Error("Please provide L1_TOKEN_ADDRESS, L2_TOKEN_ADDRESS, and BRIDGE_AMOUNT");
  }
  
  console.log("L1 Token (Ethereum):", l1TokenAddress);
  console.log("L2 Token (Base):", l2TokenAddress);
  console.log("Amount:", amount);
  console.log("Recipient on Base:", recipient);
  
  // Get bridge addresses
  const bridgeAddresses = getBridgeAddresses("ethereum");
  
  // Get token contract
  const tokenContract = await ethers.getContractAt("MyToken", l1TokenAddress);
  const decimals = await tokenContract.decimals();
  const symbol = await tokenContract.symbol();
  const amountWei = ethers.utils.parseUnits(amount, decimals);
  
  console.log("Token:", symbol);
  console.log("Amount (wei):", amountWei.toString());
  
  // Check balance
  const balance = await tokenContract.balanceOf(deployer.address);
  console.log("Current balance:", ethers.utils.formatUnits(balance, decimals), symbol);
  
  if (balance.lt(amountWei)) {
    throw new Error(`Insufficient balance. Need ${amount} ${symbol}, have ${ethers.utils.formatUnits(balance, decimals)}`);
  }
  
  // Get bridge contract
  const bridgeContract = new ethers.Contract(
    bridgeAddresses.L1_STANDARD_BRIDGE,
    L1_STANDARD_BRIDGE_ABI,
    deployer
  );
  
  // Check allowance
  const allowance = await tokenContract.allowance(deployer.address, bridgeAddresses.L1_STANDARD_BRIDGE);
  console.log("Current allowance:", ethers.utils.formatUnits(allowance, decimals), symbol);
  
  if (allowance.lt(amountWei)) {
    console.log("Approving bridge contract...");
    const approveTx = await tokenContract.approve(bridgeAddresses.L1_STANDARD_BRIDGE, amountWei);
    await approveTx.wait();
    console.log("Approval transaction:", approveTx.hash);
  }
  
  // Estimate gas for bridge transaction
  const l2Gas = 200000; // Standard gas limit for L2 execution
  const bridgeData = "0x"; // No additional data
  
  console.log("Initiating bridge deposit...");
  console.log("L2 Gas limit:", l2Gas);
  
  // Execute bridge deposit
  const depositTx = await bridgeContract.depositERC20(
    l1TokenAddress,    // L1 token address
    l2TokenAddress,    // L2 token address
    amountWei,         // Amount to bridge
    l2Gas,             // L2 gas limit
    bridgeData,        // Additional data
    {
      gasLimit: 500000 // L1 gas limit
    }
  );
  
  console.log("Bridge transaction submitted!");
  console.log("Transaction hash:", depositTx.hash);
  console.log("Waiting for confirmation...");
  
  const receipt = await depositTx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  
  // Parse deposit event
  const depositEvent = receipt.logs.find(log => {
    try {
      const parsed = bridgeContract.interface.parseLog(log);
      return parsed.name === "ERC20DepositInitiated";
    } catch {
      return false;
    }
  });
  
  if (depositEvent) {
    const parsed = bridgeContract.interface.parseLog(depositEvent);
    console.log("\n✅ Deposit Event Details:");
    console.log("L1 Token:", parsed.args._l1Token);
    console.log("L2 Token:", parsed.args._l2Token);
    console.log("From:", parsed.args._from);
    console.log("To:", parsed.args._to);
    console.log("Amount:", ethers.utils.formatUnits(parsed.args._amount, decimals), symbol);
  }
  
  // Calculate ETA
  const currentBlock = await ethers.provider.getBlockNumber();
  const eta = calculateDepositETA(currentBlock);
  
  console.log("\n📋 Bridge Status:");
  console.log("Status: Deposit initiated");
  console.log("Estimated arrival on Base:", eta.toLocaleString());
  console.log("Monitor progress with: npm run bridge-status", depositTx.hash);
  
  console.log("\n⚠️  Important Notes:");
  console.log("- Deposits typically take 10-20 minutes to appear on Base");
  console.log("- You can check the status using the bridge-status command");
  console.log("- Your tokens will appear at the L2 token address on Base");
  console.log("- Save this transaction hash:", depositTx.hash);
  
  return {
    txHash: depositTx.hash,
    l1Token: l1TokenAddress,
    l2Token: l2TokenAddress,
    amount: amount,
    recipient: recipient,
    eta: eta
  };
}

main()
  .then((result) => {
    console.log("\n🎉 Bridge deposit initiated successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });