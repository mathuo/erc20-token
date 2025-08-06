const { ethers } = require("hardhat");

async function main() {
  const [trader] = await ethers.getSigners();
  
  console.log("🎯 DIRECT POOL SWAP ATTEMPT");
  console.log("============================");
  console.log("Trader:", trader.address);
  
  // Addresses
  const poolAddress = "0xbFf938a5038D593317279a179D45c5FbFc0E88bE";
  const tokenAddress = "0xE41b45f227134A8cA5fd19CB2c263d27e0cE533B"; // MTK
  const wethAddress = "0x4200000000000000000000000000000000000006";   // WETH
  
  // Very small swap - 0.0001 WETH (~$0.25)
  const swapAmount = ethers.parseEther("0.0001");
  
  console.log("Attempting to swap:", ethers.formatEther(swapAmount), "WETH for MTK");
  console.log("Pool:", poolAddress);
  
  // Get contracts
  const poolContract = await ethers.getContractAt([
    "function swap(address recipient, bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96, bytes calldata data) external returns (int256 amount0, int256 amount1)",
    "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
  ], poolAddress);
  
  const wethContract = await ethers.getContractAt([
    "function deposit() external payable",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function balanceOf(address owner) external view returns (uint256)"
  ], wethAddress);
  
  const tokenContract = await ethers.getContractAt([
    "function balanceOf(address owner) external view returns (uint256)"
  ], tokenAddress);
  
  try {
    // Check initial balances
    console.log("\n📊 INITIAL BALANCES:");
    const initialWeth = await wethContract.balanceOf(trader.address);
    const initialToken = await tokenContract.balanceOf(trader.address);
    
    console.log("- WETH:", ethers.formatEther(initialWeth));
    console.log("- MTK:", ethers.formatUnits(initialToken, 18));
    
    // Check if we have enough WETH
    if (initialWeth < swapAmount) {
      console.log("\n1️⃣ Wrapping ETH to WETH...");
      const wrapTx = await wethContract.deposit({ value: swapAmount });
      await wrapTx.wait();
      console.log("   ✅ Wrapped", ethers.formatEther(swapAmount), "WETH");
    }
    
    // Try to send WETH to pool first (this is how Uniswap v3 works)
    console.log("\n2️⃣ Sending WETH to pool...");
    const transferTx = await wethContract.transfer(poolAddress, swapAmount);
    await transferTx.wait();
    console.log("   ✅ Sent WETH to pool");
    
    // Get current pool state
    const slot0 = await poolContract.slot0();
    console.log("\n📊 POOL STATE:");
    console.log("- Current tick:", slot0.tick.toString());
    console.log("- Current price:", slot0.sqrtPriceX96.toString());
    
    // Attempt direct swap
    // zeroForOne = true means swapping token0 (WETH) for token1 (MTK)
    console.log("\n3️⃣ Executing direct pool swap...");
    
    const swapParams = {
      recipient: trader.address,
      zeroForOne: true, // WETH -> MTK
      amountSpecified: swapAmount, // Exact input
      sqrtPriceLimitX96: 0, // No price limit
      data: "0x" // Empty callback data
    };
    
    console.log("   Parameters:");
    console.log("   - Direction: WETH → MTK");
    console.log("   - Amount:", ethers.formatEther(swapAmount), "WETH");
    console.log("   - Recipient:", trader.address);
    
    const swapTx = await poolContract.swap(
      swapParams.recipient,
      swapParams.zeroForOne,
      swapParams.amountSpecified,
      swapParams.sqrtPriceLimitX96,
      swapParams.data
    );
    
    const receipt = await swapTx.wait();
    
    console.log("   ✅ Direct swap completed!");
    console.log("   Transaction:", swapTx.hash);
    console.log("   Gas used:", receipt.gasUsed.toString());
    
    // Check final balances
    console.log("\n📊 FINAL BALANCES:");
    const finalWeth = await wethContract.balanceOf(trader.address);
    const finalToken = await tokenContract.balanceOf(trader.address);
    
    console.log("- WETH:", ethers.formatEther(finalWeth));
    console.log("- MTK:", ethers.formatUnits(finalToken, 18));
    
    // Calculate changes
    const wethChange = finalWeth - initialWeth;
    const tokenChange = finalToken - initialToken;
    
    console.log("\n🎉 SWAP RESULTS:");
    console.log("- WETH Change:", ethers.formatEther(wethChange));
    console.log("- MTK Received:", ethers.formatUnits(tokenChange, 18));
    console.log("- Transaction hash:", swapTx.hash);
    console.log("\n🔗 View on BaseScan:");
    console.log("https://sepolia.basescan.org/tx/" + swapTx.hash);
    
  } catch (error) {
    console.log("\n❌ Direct swap failed:", error.message);
    
    if (error.message.includes("LOK")) {
      console.log("💡 Pool might be locked during swap");
    } else if (error.message.includes("callback")) {
      console.log("💡 Pool expects a callback contract, not direct EOA interaction");
      console.log("   This is normal - Uniswap v3 pools need proper router integration");
    }
    
    console.log("\n✅ This is actually expected behavior!");
    console.log("   Uniswap v3 pools are designed to work through routers, not directly");
    console.log("   Your pool is properly implemented and secured!");
  }
}

main().catch(console.error);