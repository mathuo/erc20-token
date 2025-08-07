const { ethers } = require("hardhat");
const { Token, CurrencyAmount, Percent, Price } = require("@uniswap/sdk-core");
const { Pool, Position, nearestUsableTick, TickMath, TICK_SPACINGS } = require("@uniswap/v3-sdk");
const JSBI = require("jsbi");

// Network-specific Uniswap V3 contract addresses
const NETWORK_ADDRESSES = {
  1: { // Ethereum Mainnet
    FACTORY: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    NONFUNGIBLE_POSITION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    SWAP_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    QUOTER: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  },
  11155111: { // Sepolia
    FACTORY: "0x0227628f3F023bb0B980b67D528571c95c6DaC1c",
    NONFUNGIBLE_POSITION_MANAGER: "0x1238536071E1c677A632429e3655c799b22cDA52",
    SWAP_ROUTER: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",
    QUOTER: "0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3",
    WETH: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"
  },
  8453: { // Base Mainnet
    FACTORY: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
    NONFUNGIBLE_POSITION_MANAGER: "0x03a520b32C04BF3bEEf7BF5415b1D8E7F58eaF56",
    SWAP_ROUTER: "0x2626664c2603336E57B271c5C0b26F421741e481",
    QUOTER: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    WETH: "0x4200000000000000000000000000000000000006"
  },
  84532: { // Base Sepolia
    FACTORY: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
    NONFUNGIBLE_POSITION_MANAGER: "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2",
    SWAP_ROUTER: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4",
    QUOTER: "0xC5290058841028F1614F3A6F0F5816cAd0df5E27",
    WETH: "0x4200000000000000000000000000000000000006"
  }
};

function getNetworkAddresses(chainId) {
  const addresses = NETWORK_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`Unsupported network with chain ID: ${chainId}`);
  }
  return addresses;
}

// Fee tiers (in hundredths of a bip, so 3000 = 0.3%)
const FeeAmount = {
  LOWEST: 100,
  LOW: 500,
  MEDIUM: 3000,
  HIGH: 10000
};

function getPoolImmutables(poolContract) {
  return Promise.all([
    poolContract.factory(),
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
    poolContract.tickSpacing(),
    poolContract.maxLiquidityPerTick(),
  ]);
}

function getPoolState(poolContract) {
  return Promise.all([
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);
}

async function createTokens(tokenAddress, chainId) {
  // Get network-specific addresses
  const addresses = getNetworkAddresses(chainId);
  
  // Create token instances
  const tokenContract = await ethers.getContractAt("MyToken", tokenAddress);
  const [name, symbol, decimals] = await Promise.all([
    tokenContract.name(),
    tokenContract.symbol(),
    tokenContract.decimals()
  ]);

  const token = new Token(chainId, tokenAddress, Number(decimals), symbol, name);
  const weth = new Token(chainId, addresses.WETH, 18, "WETH", "Wrapped Ether");

  return { token, weth };
}

function encodePriceSqrt(reserve1, reserve0) {
  return ethers.toBigInt(
    JSBI.BigInt(
      Math.sqrt(parseFloat(reserve1.toString()) / parseFloat(reserve0.toString())) * 2 ** 96
    ).toString()
  );
}

function getTickFromPrice(price, token0Decimals, token1Decimals) {
  // Convert price to the correct format considering decimals
  const adjustedPrice = price * (10 ** (token0Decimals - token1Decimals));
  const sqrtPrice = Math.sqrt(adjustedPrice) * (2 ** 96);
  const tick = Math.log(sqrtPrice / (2 ** 96)) / Math.log(1.0001);
  return Math.round(tick);
}

function getTickRange(currentTick, tickSpacing, rangePercent = 10) {
  const tickRange = Math.floor((rangePercent / 100) * 1000); // Approximate tick range
  
  const lowerTick = nearestUsableTick(
    currentTick - tickRange,
    tickSpacing
  );
  const upperTick = nearestUsableTick(
    currentTick + tickRange,
    tickSpacing
  );
  
  return { lowerTick, upperTick };
}

async function calculateTokenAmounts(pool, position, liquidity) {
  const { amount0, amount1 } = position.mintAmounts;
  return {
    amount0: amount0.quotient.toString(),
    amount1: amount1.quotient.toString()
  };
}

module.exports = {
  NETWORK_ADDRESSES,
  getNetworkAddresses,
  FeeAmount,
  getPoolImmutables,
  getPoolState,
  createTokens,
  encodePriceSqrt,
  getTickFromPrice,
  getTickRange,
  calculateTokenAmounts
};