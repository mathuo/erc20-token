const { ethers } = require("hardhat");
const { 
  getBridgeAddresses, 
  calculateWithdrawalETA,
  L2_STANDARD_BRIDGE_ABI 
} = require("./bridgeHelpers");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Initiating withdrawal from Base to Ethereum");
  console.log("Account:", deployer.address);
  
  // Get network chain ID to ensure we're on Base
  const chainId = await deployer.getChainId();
  if (chainId !== 8453 && chainId !== 84532) { // Base mainnet or Base Sepolia
    throw new Error("This script must be run on Base network");
  }
  
  console.log("Network:", chainId === 8453 ? "Base Mainnet" : "Base Sepolia");
  
  // Get parameters
  const l2TokenAddress = process.env.L2_TOKEN_ADDRESS || process.argv[2];
  const amount = process.env.BRIDGE_AMOUNT || process.argv[3];
  const recipient = process.env.BRIDGE_RECIPIENT || process.argv[4] || deployer.address;
  
  if (!l2TokenAddress || !amount) {
    throw new Error("Please provide L2_TOKEN_ADDRESS and BRIDGE_AMOUNT");
  }
  
  console.log("L2 Token (Base):", l2TokenAddress);
  console.log("Amount:", amount);
  console.log("Recipient on Ethereum:", recipient);
  
  // Get bridge addresses
  const bridgeAddresses = getBridgeAddresses("base");
  
  // Get token contract
  const tokenContract = await ethers.getContractAt("MyToken", l2TokenAddress);
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
    bridgeAddresses.L2_STANDARD_BRIDGE,
    L2_STANDARD_BRIDGE_ABI,
    deployer
  );
  
  // Check allowance
  const allowance = await tokenContract.allowance(deployer.address, bridgeAddresses.L2_STANDARD_BRIDGE);
  console.log("Current allowance:", ethers.utils.formatUnits(allowance, decimals), symbol);
  
  if (allowance.lt(amountWei)) {
    console.log("Approving bridge contract...");
    const approveTx = await tokenContract.approve(bridgeAddresses.L2_STANDARD_BRIDGE, amountWei);
    await approveTx.wait();
    console.log("Approval transaction:", approveTx.hash);
  }
  
  // Estimate gas for bridge transaction
  const l1Gas = 200000; // Standard gas limit for L1 execution
  const bridgeData = "0x"; // No additional data
  
  console.log("Initiating bridge withdrawal...");
  console.log("L1 Gas limit:", l1Gas);
  
  // Execute bridge withdrawal
  let withdrawTx;
  if (recipient === deployer.address) {
    // Use withdraw() if sending to self
    withdrawTx = await bridgeContract.withdraw(
      l2TokenAddress,    // L2 token address
      amountWei,         // Amount to bridge
      l1Gas,             // L1 gas limit
      bridgeData,        // Additional data
      {
        gasLimit: 300000 // L2 gas limit
      }
    );
  } else {
    // Use withdrawTo() if sending to different address
    withdrawTx = await bridgeContract.withdrawTo(
      l2TokenAddress,    // L2 token address
      recipient,         // Recipient on L1
      amountWei,         // Amount to bridge
      l1Gas,             // L1 gas limit
      bridgeData,        // Additional data
      {
        gasLimit: 300000 // L2 gas limit
      }
    );
  }
  
  console.log("Withdrawal transaction submitted!");
  console.log("Transaction hash:", withdrawTx.hash);
  console.log("Waiting for confirmation...");
  
  const receipt = await withdrawTx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  
  // Parse withdrawal event
  const withdrawalEvent = receipt.logs.find(log => {
    try {
      const parsed = bridgeContract.interface.parseLog(log);
      return parsed.name === "WithdrawalInitiated";
    } catch {
      return false;
    }
  });
  
  if (withdrawalEvent) {
    const parsed = bridgeContract.interface.parseLog(withdrawalEvent);
    console.log("\n✅ Withdrawal Event Details:");
    console.log("L1 Token:", parsed.args._l1Token);
    console.log("L2 Token:", parsed.args._l2Token);
    console.log("From:", parsed.args._from);
    console.log("To:", parsed.args._to);
    console.log("Amount:", ethers.utils.formatUnits(parsed.args._amount, decimals), symbol);
  }
  
  // Calculate ETA
  const eta = calculateWithdrawalETA();
  
  console.log("\n📋 Withdrawal Status:");
  console.log("Status: Withdrawal initiated");
  console.log("Challenge period ends:", eta.toLocaleString());
  console.log("Monitor progress with: npm run bridge-status", withdrawTx.hash);
  
  console.log("\n⚠️  Important Notes:");
  console.log("- Withdrawals have a 7-day challenge period");
  console.log("- After 7 days, you must finalize the withdrawal on Ethereum");
  console.log("- Use 'npm run bridge-finalize' after the challenge period");
  console.log("- Monitor the status regularly");
  console.log("- Save this transaction hash:", withdrawTx.hash);
  
  console.log("\n📝 Next Steps:");
  console.log("1. Wait 7 days for challenge period");
  console.log("2. Prove withdrawal: npm run bridge-prove", withdrawTx.hash);
  console.log("3. Wait for finalization window");
  console.log("4. Finalize withdrawal: npm run bridge-finalize", withdrawTx.hash);
  
  return {
    txHash: withdrawTx.hash,
    l2Token: l2TokenAddress,
    amount: amount,
    recipient: recipient,
    challengeEndTime: eta
  };
}

main()
  .then((result) => {
    console.log("\n🎉 Bridge withdrawal initiated successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });