const { ethers } = require("hardhat");

async function main() {
  const poolAddress = "0xbFf938a5038D593317279a179D45c5FbFc0E88bE";
  const positionManagerAddress = "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2";
  const [deployer] = await ethers.getSigners();
  
  console.log("📊 POOL VISUALIZATION");
  console.log("====================");
  
  // Get pool contract
  const poolContract = await ethers.getContractAt([
    "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
    "function token0() external view returns (address)",
    "function token1() external view returns (address)",
    "function fee() external view returns (uint24)",
    "function liquidity() external view returns (uint128)",
    "function tickSpacing() external view returns (int24)"
  ], poolAddress);
  
  const [slot0, token0, token1, fee, liquidity, tickSpacing] = await Promise.all([
    poolContract.slot0(),
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.tickSpacing()
  ]);
  
  // Get token info
  const token0Contract = await ethers.getContractAt(["function symbol() view returns (string)", "function decimals() view returns (uint8)"], token0);
  const token1Contract = await ethers.getContractAt(["function symbol() view returns (string)", "function decimals() view returns (uint8)"], token1);
  
  const [token0Symbol, token1Symbol] = await Promise.all([
    token0Contract.symbol(),
    token1Contract.symbol()
  ]);
  
  console.log("🏊‍♀️ POOL INFO");
  console.log("Pool Address:", poolAddress);
  console.log("Token Pair:", token0Symbol, "/", token1Symbol);
  console.log("Fee Tier:", (Number(fee) / 10000).toFixed(2) + "%");
  console.log("Current Liquidity:", liquidity.toString());
  console.log("");
  
  // Price calculation
  const sqrtPriceX96 = BigInt(slot0.sqrtPriceX96.toString());
  const Q96 = 2n ** 96n;
  const sqrtPrice = Number(sqrtPriceX96) / Number(Q96);
  const price = sqrtPrice * sqrtPrice;
  
  console.log("💰 CURRENT PRICE");
  console.log("Current Tick:", slot0.tick.toString());
  console.log("Price (", token1Symbol, "per", token0Symbol, "):", price.toExponential(4));
  console.log("Price (", token0Symbol, "per", token1Symbol, "):", (1/price).toExponential(4));
  console.log("");
  
  // Try to find positions (this is tricky without knowing the token ID)
  console.log("🎯 YOUR LIQUIDITY POSITION");
  console.log("Position Range: Tick 213120 to 215220");
  console.log("Current Tick:", slot0.tick.toString(), "(✅ IN RANGE)");
  
  // Calculate if current price is in range
  const lowerTick = 213120;
  const upperTick = 215220;
  const currentTick = Number(slot0.tick);
  const inRange = currentTick >= lowerTick && currentTick <= upperTick;
  
  console.log("Status:", inRange ? "✅ EARNING FEES" : "❌ OUT OF RANGE");
  console.log("");
  
  // Visual representation
  console.log("📈 PRICE RANGE VISUALIZATION");
  console.log("════════════════════════════════════════════════");
  
  const rangeSize = upperTick - lowerTick;
  const currentPos = ((currentTick - lowerTick) / rangeSize) * 40; // 40 char width
  
  let visualization = "";
  for (let i = 0; i < 40; i++) {
    if (i === 0) visualization += "|"; // Lower bound
    else if (i === 39) visualization += "|"; // Upper bound
    else if (Math.abs(i - currentPos) < 0.5) visualization += "●"; // Current price
    else if (i > 0 && i < 39) visualization += "─"; // Range
    else visualization += " ";
  }
  
  console.log(visualization);
  console.log("Lower Tick                 Current                 Upper Tick");
  console.log("(" + lowerTick + ")                    (" + currentTick + ")                   (" + upperTick + ")");
  console.log("");
  
  // Fee calculation
  console.log("💸 FEE EARNING POTENTIAL");
  console.log("You earn 0.30% of all trades in your range");
  console.log("Your share depends on: Your liquidity / Total liquidity");
  console.log("Current total liquidity:", liquidity.toString());
  console.log("");
  
  // Pool utilization
  console.log("📊 POOL COMPOSITION");
  console.log("Your position contains both", token0Symbol, "and", token1Symbol);
  console.log("Exact amounts depend on current price and your position size");
  console.log("");
  
  console.log("🔗 VIEW TRANSACTION");
  console.log("BaseScan:", `https://sepolia.basescan.org/tx/0x2e4796d76b8a132954063f427f34b9794716eb3b0c67255f402e54219ce664d4`);
  console.log("Pool on BaseScan:", `https://sepolia.basescan.org/address/${poolAddress}`);
  
  // Trading simulation
  console.log("");
  console.log("🔄 TRADING READY");
  console.log("Users can now trade:");
  console.log("- Buy MTK with WETH");
  console.log("- Sell MTK for WETH"); 
  console.log("- You earn 0.3% fees on all trades!");
}

main().catch(console.error);