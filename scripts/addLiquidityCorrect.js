const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("💧 Adding Liquidity with Correct Ratio");
  console.log("Account:", deployer.address);
  
  // Addresses
  const tokenAddress = "0xE41b45f227134A8cA5fd19CB2c263d27e0cE533B"; // MTK
  const wethAddress = "0x4200000000000000000000000000000000000006";   // WETH
  const positionManagerAddress = "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2";
  
  // Based on our debugging: 1 WETH = 2 billion MTK at current price
  // So let's add liquidity accordingly
  const wethAmount = ethers.parseEther("0.005"); // 0.005 WETH
  const mtkAmount = ethers.parseUnits("10000000", 18); // 10 million MTK (much less than 2 billion)
  
  console.log("Adding liquidity:");
  console.log("- WETH:", ethers.formatEther(wethAmount));
  console.log("- MTK:", ethers.formatUnits(mtkAmount, 18));
  
  // Get contracts
  const wethContract = await ethers.getContractAt([
    "function deposit() external payable",
    "function approve(address spender, uint256 amount) external returns (bool)"
  ], wethAddress);
  
  const tokenContract = await ethers.getContractAt([
    "function approve(address spender, uint256 amount) external returns (bool)"
  ], tokenAddress);
  
  const positionManager = await ethers.getContractAt([
    "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)"
  ], positionManagerAddress);
  
  try {
    // 1. Wrap ETH
    console.log("1. Wrapping ETH...");
    const wrapTx = await wethContract.deposit({ value: wethAmount });
    await wrapTx.wait();
    console.log("   ✅ Wrapped");
    
    // 2. Approve tokens
    console.log("2. Approving tokens...");
    await (await wethContract.approve(positionManagerAddress, ethers.MaxUint256)).wait();
    await (await tokenContract.approve(positionManagerAddress, ethers.MaxUint256)).wait();
    console.log("   ✅ Approved");
    
    // 3. Add liquidity with proper tick range
    console.log("3. Adding liquidity...");
    const mintParams = {
      token0: wethAddress,  // WETH is token0
      token1: tokenAddress, // MTK is token1
      fee: 3000,
      tickLower: 213120,    // From our debug script
      tickUpper: 215220,    // From our debug script
      amount0Desired: wethAmount.toString(),
      amount1Desired: mtkAmount.toString(),
      amount0Min: (wethAmount * 90n) / 100n, // 10% slippage
      amount1Min: (mtkAmount * 90n) / 100n,  // 10% slippage
      recipient: deployer.address,
      deadline: Math.floor(Date.now() / 1000) + 1200 // 20 minutes
    };
    
    console.log("   Parameters:");
    console.log("   - Token0 (WETH):", ethers.formatEther(mintParams.amount0Desired));
    console.log("   - Token1 (MTK):", ethers.formatUnits(mintParams.amount1Desired, 18));
    console.log("   - Tick Range:", mintParams.tickLower, "to", mintParams.tickUpper);
    
    const mintTx = await positionManager.mint(mintParams);
    const receipt = await mintTx.wait();
    
    console.log("   ✅ Success!");
    console.log("   Transaction:", mintTx.hash);
    console.log("   Gas used:", receipt.gasUsed.toString());
    
    // Try to parse the position ID from logs
    const logs = receipt.logs;
    console.log("   Created position NFT (check transaction for details)");
    
  } catch (error) {
    console.log("❌ Failed:", error.message);
    
    if (error.message.includes("slippage")) {
      console.log("\n💡 Try adjusting the amounts:");
      console.log("- Reduce MTK amount further");
      console.log("- Or try single-sided liquidity (only WETH or only MTK)");
    }
  }
}

main().catch(console.error);