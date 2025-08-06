const { ethers } = require("hardhat");

async function main() {
  const [trader] = await ethers.getSigners();
  
  console.log("💱 EXECUTING PROPER SWAP");
  console.log("=========================");
  console.log("Trader:", trader.address);
  
  // Addresses
  const poolAddress = "0xbFf938a5038D593317279a179D45c5FbFc0E88bE";
  const tokenAddress = "0xE41b45f227134A8cA5fd19CB2c263d27e0cE533B"; // MTK
  const wethAddress = "0x4200000000000000000000000000000000000006";   // WETH
  const swapHelperAddress = "0xf8160892a1Fa7ba2C4bE15602d9A251C3222370A"; // Our new contract
  
  // Small swap amount
  const swapAmount = ethers.parseEther("0.0005"); // 0.0005 WETH (~$1.25)
  
  console.log("Swap Details:");
  console.log("- Amount:", ethers.formatEther(swapAmount), "WETH");
  console.log("- Pool:", poolAddress);
  console.log("- Helper Contract:", swapHelperAddress);
  console.log("");
  
  // Get contracts
  const wethContract = await ethers.getContractAt([
    "function deposit() external payable",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address owner) external view returns (uint256)"
  ], wethAddress);
  
  const tokenContract = await ethers.getContractAt([
    "function balanceOf(address owner) external view returns (uint256)"
  ], tokenAddress);
  
  const swapHelper = await ethers.getContractAt([
    "function swapExact(address pool, address tokenIn, address tokenOut, uint256 amountIn, bool zeroForOne) external returns (int256 amount0, int256 amount1)"
  ], swapHelperAddress);
  
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
    
    // Step 1: Ensure we have enough WETH
    if (initialWeth < swapAmount) {
      console.log("1️⃣ Wrapping ETH to WETH...");
      const wrapTx = await wethContract.deposit({ 
        value: swapAmount - initialWeth + ethers.parseEther("0.001") // Extra for gas
      });
      await wrapTx.wait();
      console.log("   ✅ Wrapped ETH");
    }
    
    // Step 2: Approve SwapHelper to spend our WETH
    console.log("2️⃣ Approving SwapHelper contract...");
    const approveTx = await wethContract.approve(swapHelperAddress, swapAmount);
    await approveTx.wait();
    console.log("   ✅ Approved", ethers.formatEther(swapAmount), "WETH");
    
    // Step 3: Execute swap through our helper
    console.log("3️⃣ Executing swap through helper contract...");
    console.log("   - Trading WETH for MTK");
    console.log("   - Using proper callback mechanism");
    
    const swapTx = await swapHelper.swapExact(
      poolAddress,
      wethAddress,    // tokenIn (WETH)
      tokenAddress,   // tokenOut (MTK)
      swapAmount,     // amountIn
      true           // zeroForOne (WETH is token0, MTK is token1)
    );
    
    const receipt = await swapTx.wait();
    
    console.log("   ✅ Swap executed!");
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
    const wethChange = finalWeth - initialWeth;
    const tokenChange = finalToken - initialToken;
    
    console.log("🎉 SWAP RESULTS:");
    console.log("- WETH Spent:", ethers.formatEther(-wethChange));
    console.log("- MTK Received:", ethers.formatUnits(tokenChange, 18));
    console.log("- Effective Price:", ethers.formatEther(-wethChange), "WETH per", ethers.formatUnits(tokenChange, 18), "MTK");
    console.log("");
    console.log("💰 YOU EARNED FEES!");
    console.log("- 0.3% of", ethers.formatEther(swapAmount), "WETH");
    console.log("- Fee earned:", ethers.formatEther(swapAmount * 3n / 1000n), "WETH");
    console.log("");
    console.log("🔗 View transaction:");
    console.log("https://sepolia.basescan.org/tx/" + swapTx.hash);
    
  } catch (error) {
    console.log("❌ Swap failed:", error.message);
    
    if (error.message.includes("transfer")) {
      console.log("💡 Check token approvals and balances");
    } else if (error.message.includes("callback")) {
      console.log("💡 Callback mechanism issue - contract might need adjustment");
    }
  }
}

main().catch(console.error);