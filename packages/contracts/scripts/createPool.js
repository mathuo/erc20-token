const { ethers } = require("hardhat");
const { 
  getNetworkAddresses, 
  FeeAmount, 
  createTokens,
  encodePriceSqrt 
} = require("./uniswapHelpers");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Creating Uniswap V3 pool with account:", deployer.address);
  
  // Get network chain ID
  const chainId = Number(await ethers.provider.getNetwork().then(n => n.chainId));
  const addresses = getNetworkAddresses(chainId);
  
  console.log("Network:", chainId === 1 ? "Ethereum Mainnet" : chainId === 8453 ? "Base Mainnet" : `Chain ID ${chainId}`);
  
  // Get your token address from command line args or environment
  const tokenAddress = process.env.TOKEN_ADDRESS || process.argv[2];
  if (!tokenAddress) {
    throw new Error("Please provide TOKEN_ADDRESS environment variable or command line argument");
  }
  
  console.log("Token address:", tokenAddress);
  console.log("WETH address:", addresses.WETH);
  
  // Create token instances
  const { token, weth } = await createTokens(tokenAddress, chainId);
  
  // Determine token order (token0 should be the lower address)
  const token0 = token.address.toLowerCase() < weth.address.toLowerCase() ? token : weth;
  const token1 = token.address.toLowerCase() < weth.address.toLowerCase() ? weth : token;
  
  console.log("Token0:", token0.address, token0.symbol);
  console.log("Token1:", token1.address, token1.symbol);
  
  // Set initial price (example: 1 ETH = 1000 tokens)
  // You should adjust this based on your desired initial price
  const initialPrice = process.env.INITIAL_PRICE || "0.001"; // 1 token = 0.001 ETH
  
  let sqrtPriceX96;
  if (token0.address.toLowerCase() === token.address.toLowerCase()) {
    // Token is token0, price is token/ETH
    sqrtPriceX96 = encodePriceSqrt(
      ethers.parseEther(initialPrice),
      ethers.parseUnits("1", token.decimals)
    );
  } else {
    // Token is token1, price is ETH/token
    sqrtPriceX96 = encodePriceSqrt(
      ethers.parseUnits("1", token.decimals),
      ethers.parseEther(initialPrice)
    );
  }
  
  console.log("Initial price (token/ETH):", initialPrice);
  console.log("Square root price X96:", sqrtPriceX96.toString());
  
  // Get factory contract
  const factoryABI = [
    "function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)",
    "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address)"
  ];
  
  const factory = new ethers.Contract(
    addresses.FACTORY,
    factoryABI,
    deployer
  );
  
  // Check if pool already exists
  const existingPool = await factory.getPool(token0.address, token1.address, FeeAmount.MEDIUM);
  
  if (existingPool !== ethers.ZeroAddress) {
    console.log("Pool already exists at:", existingPool);
    return existingPool;
  }
  
  // Create the pool
  console.log("Creating new pool...");
  const createPoolTx = await factory.createPool(
    token0.address,
    token1.address,
    FeeAmount.MEDIUM
  );
  
  await createPoolTx.wait();
  console.log("Pool creation transaction:", createPoolTx.hash);
  
  // Get the new pool address
  const poolAddress = await factory.getPool(token0.address, token1.address, FeeAmount.MEDIUM);
  console.log("New pool created at:", poolAddress);
  
  // Initialize the pool with the starting price
  const poolABI = [
    "function initialize(uint160 sqrtPriceX96) external"
  ];
  
  const pool = new ethers.Contract(poolAddress, poolABI, deployer);
  
  console.log("Initializing pool with price...");
  const initTx = await pool.initialize(sqrtPriceX96);
  await initTx.wait();
  console.log("Pool initialization transaction:", initTx.hash);
  
  console.log("✅ Pool created and initialized successfully!");
  console.log("Pool address:", poolAddress);
  console.log("Fee tier: 0.3%");
  console.log("Initial price:", initialPrice, "ETH per token");
  
  return poolAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });