const { ethers } = require("hardhat");

async function main() {
  console.log("💰 COLLECTING TOKENS FROM POSITION");
  console.log("==================================");
  
  const [owner] = await ethers.getSigners();
  const positionManagerAddress = "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2";
  const tokenId = 67320; // Our position NFT ID
  
  const positionManager = await ethers.getContractAt([
    "function collect((uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max)) external payable returns (uint256 amount0, uint256 amount1)",
    "function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)"
  ], positionManagerAddress);
  
  // Check position status
  const position = await positionManager.positions(tokenId);
  console.log("Position status:");
  console.log("- Liquidity:", position.liquidity.toString());
  console.log("- Tokens owed 0:", position.tokensOwed0.toString());
  console.log("- Tokens owed 1:", position.tokensOwed1.toString());
  
  if (position.tokensOwed0 > 0n || position.tokensOwed1 > 0n) {
    console.log("\n💰 Collecting owed tokens...");
    
    try {
      const collectParams = {
        tokenId: tokenId,
        recipient: owner.address,
        amount0Max: "340282366920938463463374607431768211455", // MaxUint128
        amount1Max: "340282366920938463463374607431768211455"  // MaxUint128
      };
      
      const collectTx = await positionManager.collect(collectParams);
      await collectTx.wait();
      
      console.log("✅ Tokens collected!");
      console.log("Transaction:", collectTx.hash);
      
    } catch (error) {
      console.log("❌ Collection failed:", error.message);
    }
  } else {
    console.log("ℹ️  No tokens to collect");
  }
  
  // Check final balances
  const wethAddress = "0x4200000000000000000000000000000000000006";
  const tokenAddress = "0xE41b45f227134A8cA5fd19CB2c263d27e0cE533B";
  
  const wethContract = await ethers.getContractAt([
    "function balanceOf(address owner) external view returns (uint256)"
  ], wethAddress);
  
  const tokenContract = await ethers.getContractAt([
    "function balanceOf(address owner) external view returns (uint256)"
  ], tokenAddress);
  
  const poolContract = await ethers.getContractAt([
    "function liquidity() external view returns (uint128)"
  ], "0xbFf938a5038D593317279a179D45c5FbFc0E88bE");
  
  console.log("\n📊 FINAL BALANCES:");
  const finalWeth = await wethContract.balanceOf(owner.address);
  const finalToken = await tokenContract.balanceOf(owner.address);
  const finalPoolLiquidity = await poolContract.liquidity();
  const poolWethBalance = await wethContract.balanceOf("0xbFf938a5038D593317279a179D45c5FbFc0E88bE");
  
  console.log("- Your WETH:", ethers.formatEther(finalWeth));
  console.log("- Your MTK:", ethers.formatUnits(finalToken, 18));
  console.log("- Pool liquidity:", finalPoolLiquidity.toString());
  console.log("- WETH remaining in pool:", ethers.formatEther(poolWethBalance));
  
  if (finalPoolLiquidity === 0n) {
    console.log("\n🎉 SUCCESS! Pool is now empty of your liquidity");
  } else {
    console.log("\n⚠️  Pool still has liquidity (might be from other LPs)");
  }
  
  if (poolWethBalance > 0n) {
    console.log("\n💡 ABOUT REMAINING WETH IN POOL:");
    console.log("The", ethers.formatEther(poolWethBalance), "WETH still in pool is from:");
    console.log("- Failed direct swap attempts");
    console.log("- This WETH is technically 'stuck' unless pool has recovery function");
    console.log("- It's not part of active liquidity positions");
  }
}

main().catch(console.error);