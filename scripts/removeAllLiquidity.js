const { ethers } = require("hardhat");

async function main() {
  console.log("💧 REMOVING ALL LIQUIDITY FROM POOL");
  console.log("===================================");
  
  const [owner] = await ethers.getSigners();
  console.log("Account:", owner.address);
  
  // Addresses
  const poolAddress = "0xbFf938a5038D593317279a179D45c5FbFc0E88bE";
  const tokenAddress = "0xE41b45f227134A8cA5fd19CB2c263d27e0cE533B"; // MTK
  const wethAddress = "0x4200000000000000000000000000000000000006"; // WETH
  const positionManagerAddress = "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2";
  
  console.log("Pool:", poolAddress);
  console.log("Position Manager:", positionManagerAddress);
  
  // Get contracts
  const poolContract = await ethers.getContractAt([
    "function liquidity() external view returns (uint128)"
  ], poolAddress);
  
  const positionManager = await ethers.getContractAt([
    "function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
    "function ownerOf(uint256 tokenId) external view returns (address owner)",
    "function balanceOf(address owner) external view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
    "function decreaseLiquidity((uint256 tokenId, uint128 liquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline)) external payable returns (uint256 amount0, uint256 amount1)",
    "function collect((uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max)) external payable returns (uint256 amount0, uint256 amount1)"
  ], positionManagerAddress);
  
  const wethContract = await ethers.getContractAt([
    "function balanceOf(address owner) external view returns (uint256)"
  ], wethAddress);
  
  const tokenContract = await ethers.getContractAt([
    "function balanceOf(address owner) external view returns (uint256)"
  ], tokenAddress);
  
  try {
    // First, find our position NFT
    console.log("\n1️⃣ Finding your liquidity position...");
    const nftBalance = await positionManager.balanceOf(owner.address);
    console.log("You own", nftBalance.toString(), "position NFTs");
    
    if (nftBalance === 0n) {
      console.log("❌ No position NFTs found!");
      console.log("💡 This means you might not own a liquidity position");
      console.log("   Or the position was created differently");
      return;
    }
    
    // Get all position token IDs
    let positionTokenId = null;
    let positionInfo = null;
    
    for (let i = 0; i < nftBalance; i++) {
      const tokenId = await positionManager.tokenOfOwnerByIndex(owner.address, i);
      const position = await positionManager.positions(tokenId);
      
      console.log(`\nPosition NFT #${tokenId}:`);
      console.log("- Token0:", position.token0);
      console.log("- Token1:", position.token1);
      console.log("- Liquidity:", position.liquidity.toString());
      console.log("- Tick Range:", position.tickLower, "to", position.tickUpper);
      
      // Check if this is our MTK/WETH position
      const isOurPosition = (
        (position.token0.toLowerCase() === wethAddress.toLowerCase() && 
         position.token1.toLowerCase() === tokenAddress.toLowerCase()) ||
        (position.token0.toLowerCase() === tokenAddress.toLowerCase() && 
         position.token1.toLowerCase() === wethAddress.toLowerCase())
      );
      
      if (isOurPosition && position.liquidity > 0n) {
        positionTokenId = tokenId;
        positionInfo = position;
        console.log("✅ Found our MTK/WETH position!");
        break;
      }
    }
    
    if (!positionTokenId) {
      console.log("❌ No MTK/WETH position found with liquidity!");
      return;
    }
    
    // Check balances before
    console.log("\n📊 BEFORE LIQUIDITY REMOVAL:");
    const beforeWeth = await wethContract.balanceOf(owner.address);
    const beforeToken = await tokenContract.balanceOf(owner.address);
    const poolLiquidity = await poolContract.liquidity();
    
    console.log("- Your WETH:", ethers.formatEther(beforeWeth));
    console.log("- Your MTK:", ethers.formatUnits(beforeToken, 18));
    console.log("- Total pool liquidity:", poolLiquidity.toString());
    console.log("- Your position liquidity:", positionInfo.liquidity.toString());
    
    // Remove all liquidity
    console.log("\n2️⃣ Removing all liquidity...");
    const decreaseParams = {
      tokenId: positionTokenId,
      liquidity: positionInfo.liquidity, // Remove ALL liquidity
      amount0Min: 0, // Accept any amount
      amount1Min: 0, // Accept any amount
      deadline: Math.floor(Date.now() / 1000) + 300
    };
    
    console.log("Decrease parameters:");
    console.log("- Token ID:", positionTokenId.toString());
    console.log("- Liquidity to remove:", positionInfo.liquidity.toString());
    
    const decreaseTx = await positionManager.decreaseLiquidity(decreaseParams);
    const decreaseReceipt = await decreaseTx.wait();
    
    console.log("✅ Liquidity removed!");
    console.log("Transaction:", decreaseTx.hash);
    
    // Collect the tokens
    console.log("\n3️⃣ Collecting tokens...");
    const collectParams = {
      tokenId: positionTokenId,
      recipient: owner.address,
      amount0Max: ethers.MaxUint128, // Collect all
      amount1Max: ethers.MaxUint128  // Collect all
    };
    
    const collectTx = await positionManager.collect(collectParams);
    const collectReceipt = await collectTx.wait();
    
    console.log("✅ Tokens collected!");
    console.log("Transaction:", collectTx.hash);
    
    // Check final balances
    console.log("\n📊 AFTER LIQUIDITY REMOVAL:");
    const afterWeth = await wethContract.balanceOf(owner.address);
    const afterToken = await tokenContract.balanceOf(owner.address);
    const finalPoolLiquidity = await poolContract.liquidity();
    
    console.log("- Your WETH:", ethers.formatEther(afterWeth));
    console.log("- Your MTK:", ethers.formatUnits(afterToken, 18));
    console.log("- Pool liquidity now:", finalPoolLiquidity.toString());
    
    // Calculate what we recovered
    const wethRecovered = afterWeth - beforeWeth;
    const tokenRecovered = afterToken - beforeToken;
    
    console.log("\n🎉 RECOVERY SUMMARY:");
    console.log("- WETH recovered:", ethers.formatEther(wethRecovered));
    console.log("- MTK recovered:", ethers.formatUnits(tokenRecovered, 18));
    
    if (wethRecovered > 0 || tokenRecovered > 0) {
      console.log("✅ Successfully recovered your liquidity!");
    }
    
    // Check if there's any remaining stuck WETH in the pool
    const poolWethBalance = await wethContract.balanceOf(poolAddress);
    console.log("\n💰 REMAINING IN POOL:");
    console.log("- WETH still in pool:", ethers.formatEther(poolWethBalance));
    
    if (poolWethBalance > 0) {
      console.log("⚠️  Note: There's still WETH in the pool from failed swap attempts");
      console.log("   This is permanently locked unless pool has a recovery mechanism");
    }
    
  } catch (error) {
    console.log("❌ Liquidity removal failed:", error.message);
    
    if (error.message.includes("Invalid token ID")) {
      console.log("💡 Position NFT might not exist or belong to you");
    } else if (error.message.includes("Not authorized")) {
      console.log("💡 You might not own this position");
    }
  }
}

main().catch(console.error);