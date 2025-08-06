const { ethers } = require("hardhat");

async function main() {
  const poolAddress = "0xbFf938a5038D593317279a179D45c5FbFc0E88bE";
  
  const poolContract = await ethers.getContractAt([
    "function liquidity() external view returns (uint128)",
    "function token0() external view returns (address)", 
    "function token1() external view returns (address)",
    "function fee() external view returns (uint24)",
    "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
  ], poolAddress);
  
  const [liquidity, token0, token1, fee, slot0] = await Promise.all([
    poolContract.liquidity(),
    poolContract.token0(),
    poolContract.token1(), 
    poolContract.fee(),
    poolContract.slot0()
  ]);
  
  console.log("🏊 Pool Liquidity Check");
  console.log("=======================");
  console.log("Pool Address:", poolAddress);
  console.log("Token0 (WETH):", token0);
  console.log("Token1 (MTK):", token1);  
  console.log("Fee Tier:", fee.toString() + " (0.3%)");
  console.log("Current Liquidity:", liquidity.toString());
  console.log("Current Tick:", slot0.tick.toString());
  console.log("Current Price (sqrt):", slot0.sqrtPriceX96.toString());
  console.log("");
  console.log("Has Liquidity?", liquidity > 0n ? "✅ YES" : "❌ NO");
  
  if (liquidity === 0n) {
    console.log("⚠️  Pool is initialized but has no liquidity positions");
    console.log("   Trades cannot be executed until liquidity is added");
  } else {
    console.log("✅ Pool is ready for trading");
  }
}

main().catch(console.error);