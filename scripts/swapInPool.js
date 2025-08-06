const { ethers } = require("hardhat");

async function main() {
  const [trader] = await ethers.getSigners();
  
  console.log("💱 MAKING A $1 SWAP IN YOUR POOL");
  console.log("=================================");
  console.log("Trader:", trader.address);
  
  // Addresses
  const tokenAddress = "0xE41b45f227134A8cA5fd19CB2c263d27e0cE533B"; // MTK
  const wethAddress = "0x4200000000000000000000000000000000000006";   // WETH
  const swapRouterAddress = "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4"; // Base Sepolia router
  const poolAddress = "0xbFf938a5038D593317279a179D45c5FbFc0E88bE";
  
  // Calculate $1 worth of ETH (assume ETH = $2500)
  const ethPrice = 2500; // USD per ETH
  const dollarAmount = 1.0; // $1
  const ethAmount = dollarAmount / ethPrice; // ~0.0004 ETH
  const wethAmountIn = ethers.parseEther(ethAmount.toString());
  
  console.log("Trade Details:");
  console.log("- Swapping:", ethers.formatEther(wethAmountIn), "WETH");
  console.log("- Worth approximately: $" + dollarAmount.toFixed(2));
  console.log("- Pool:", poolAddress);
  console.log("");
  
  // Get contracts
  const wethContract = await ethers.getContractAt([
    "function deposit() external payable",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address owner) external view returns (uint256)"
  ], wethAddress);
  
  const tokenContract = await ethers.getContractAt([
    "function balanceOf(address owner) external view returns (uint256)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)"
  ], tokenAddress);
  
  const swapRouter = await ethers.getContractAt([
    "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)"
  ], swapRouterAddress);
  
  try {
    // Check initial balances
    console.log("📊 BEFORE SWAP:");
    const initialEth = await ethers.provider.getBalance(trader.address);
    const initialWeth = await wethContract.balanceOf(trader.address);
    const initialToken = await tokenContract.balanceOf(trader.address);
    
    console.log("- ETH Balance:", ethers.formatEther(initialEth));
    console.log("- WETH Balance:", ethers.formatEther(initialWeth));
    console.log("- MTK Balance:", ethers.formatUnits(initialToken, 18));
    console.log("");
    
    // Step 1: Wrap ETH to WETH
    console.log("1️⃣ Wrapping ETH to WETH...");
    const wrapTx = await wethContract.deposit({ value: wethAmountIn });
    await wrapTx.wait();
    console.log("   ✅ Wrapped", ethers.formatEther(wethAmountIn), "WETH");
    
    // Step 2: Approve router
    console.log("2️⃣ Approving WETH for swap...");
    const approveTx = await wethContract.approve(swapRouterAddress, wethAmountIn);
    await approveTx.wait();
    console.log("   ✅ Approved");
    
    // Step 3: Execute swap
    console.log("3️⃣ Executing swap...");
    const swapParams = {
      tokenIn: wethAddress,
      tokenOut: tokenAddress,
      fee: 3000, // 0.3%
      recipient: trader.address,
      deadline: Math.floor(Date.now() / 1000) + 300, // 5 minutes
      amountIn: wethAmountIn,
      amountOutMinimum: 0, // Accept any amount for demo
      sqrtPriceLimitX96: 0 // No price limit
    };
    
    console.log("   Swap Parameters:");
    console.log("   - Token In: WETH");
    console.log("   - Token Out: MTK");  
    console.log("   - Amount In:", ethers.formatEther(wethAmountIn), "WETH");
    console.log("   - Fee: 0.3%");
    
    const swapTx = await swapRouter.exactInputSingle(swapParams);
    const receipt = await swapTx.wait();
    
    console.log("   ✅ Swap completed!");
    console.log("   Transaction:", swapTx.hash);
    console.log("   Gas used:", receipt.gasUsed.toString());
    console.log("");
    
    // Check final balances
    console.log("📊 AFTER SWAP:");
    const finalEth = await ethers.provider.getBalance(trader.address);
    const finalWeth = await wethContract.balanceOf(trader.address);
    const finalToken = await tokenContract.balanceOf(trader.address);
    
    console.log("- ETH Balance:", ethers.formatEther(finalEth));
    console.log("- WETH Balance:", ethers.formatEther(finalWeth));
    console.log("- MTK Balance:", ethers.formatUnits(finalToken, 18));
    console.log("");
    
    // Calculate changes
    const tokenReceived = finalToken - initialToken;
    console.log("🎉 SWAP RESULTS:");
    console.log("- Received:", ethers.formatUnits(tokenReceived, 18), "MTK");
    console.log("- For:", ethers.formatEther(wethAmountIn), "WETH ($" + dollarAmount.toFixed(2) + ")");
    console.log("- You earned 0.3% fee on this trade!");
    console.log("");
    console.log("🔗 View on BaseScan:");
    console.log("https://sepolia.basescan.org/tx/" + swapTx.hash);
    
  } catch (error) {
    console.log("❌ Swap failed:", error.message);
    
    if (error.message.includes("STF")) {
      console.log("💡 This might be due to insufficient liquidity or slippage");
      console.log("   Try a smaller amount or check pool state");
    }
  }
}

main().catch(console.error);