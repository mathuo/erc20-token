const { ethers } = require("hardhat");

async function main() {
  const poolAddress = "0xbFf938a5038D593317279a179D45c5FbFc0E88bE";
  
  console.log("🔍 Debugging Pool State");
  console.log("======================");
  
  const poolContract = await ethers.getContractAt([
    "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
    "function token0() external view returns (address)",
    "function token1() external view returns (address)",
    "function fee() external view returns (uint24)",
    "function tickSpacing() external view returns (int24)"
  ], poolAddress);
  
  const [slot0, token0, token1, fee, tickSpacing] = await Promise.all([
    poolContract.slot0(),
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
    poolContract.tickSpacing()
  ]);
  
  console.log("Pool Address:", poolAddress);
  console.log("Token0 (WETH):", token0);
  console.log("Token1 (MTK):", token1);
  console.log("Fee:", fee.toString());
  console.log("Tick Spacing:", tickSpacing.toString());
  console.log("");
  console.log("Current State:");
  console.log("- Current Tick:", slot0.tick.toString());
  console.log("- Sqrt Price X96:", slot0.sqrtPriceX96.toString());
  
  // Calculate actual price from sqrtPriceX96
  // Price = (sqrtPriceX96 / 2^96)^2
  const sqrtPriceX96 = BigInt(slot0.sqrtPriceX96.toString());
  const Q96 = 2n ** 96n;
  
  // Convert to floating point for easier reading
  const sqrtPrice = Number(sqrtPriceX96) / Number(Q96);
  const price = sqrtPrice * sqrtPrice;
  
  console.log("- Current Price (token1/token0):", price.toExponential());
  console.log("- Current Price (MTK per WETH):", (1/price).toExponential());
  console.log("- Current Price (WETH per MTK):", price.toExponential());
  
  // Calculate what amounts would be balanced at current price
  const ethAmount = 0.01; // 0.01 ETH
  const tokenAmount = ethAmount / price; // How many tokens for this ETH
  
  console.log("");
  console.log("💡 For balanced liquidity:");
  console.log("- If you provide", ethAmount, "WETH");
  console.log("- You should provide", tokenAmount.toExponential(), "MTK");
  console.log("- Or about", (tokenAmount / 1e18).toFixed(0), "MTK (in whole tokens)");
  
  // Check current balances
  const [deployer] = await ethers.getSigners();
  const tokenContract = await ethers.getContractAt("MyToken", token1);
  const balance = await tokenContract.balanceOf(deployer.address);
  
  console.log("");
  console.log("Your current balance:", ethers.formatUnits(balance, 18), "MTK");
  
  // Suggest tick range
  const currentTick = Number(slot0.tick);
  const spacing = Number(tickSpacing);
  
  // Round to valid ticks
  const lowerTick = Math.floor((currentTick - 1000) / spacing) * spacing;
  const upperTick = Math.ceil((currentTick + 1000) / spacing) * spacing;
  
  console.log("");
  console.log("📊 Suggested parameters:");
  console.log("- Lower Tick:", lowerTick);
  console.log("- Upper Tick:", upperTick);
  console.log("- Current Tick:", currentTick, "(should be between lower and upper)");
}

main().catch(console.error);