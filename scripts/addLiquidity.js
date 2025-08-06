const { ethers } = require("hardhat");
const { Token, CurrencyAmount, Percent } = require("@uniswap/sdk-core");
const { Pool, Position, nearestUsableTick, NonfungiblePositionManager } = require("@uniswap/v3-sdk");
const { 
  getNetworkAddresses, 
  FeeAmount, 
  getPoolImmutables,
  getPoolState,
  createTokens,
  getTickRange 
} = require("./uniswapHelpers");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Adding liquidity with account:", deployer.address);
  
  // Get network chain ID
  const chainId = Number(await ethers.provider.getNetwork().then(n => n.chainId));
  const addresses = getNetworkAddresses(chainId);
  
  console.log("Network:", chainId === 1 ? "Ethereum Mainnet" : chainId === 8453 ? "Base Mainnet" : `Chain ID ${chainId}`);
  
  // Get parameters from environment or command line
  const tokenAddress = process.env.TOKEN_ADDRESS || process.argv[2];
  const poolAddress = process.env.POOL_ADDRESS || process.argv[3];
  const tokenAmount = process.env.TOKEN_AMOUNT || process.argv[4] || "1000"; // Default 1000 tokens
  const ethAmount = process.env.ETH_AMOUNT || process.argv[5] || "1"; // Default 1 ETH
  
  if (!tokenAddress || !poolAddress) {
    throw new Error("Please provide TOKEN_ADDRESS and POOL_ADDRESS");
  }
  
  console.log("Token address:", tokenAddress);
  console.log("Pool address:", poolAddress);
  console.log("Token amount:", tokenAmount);
  console.log("ETH amount:", ethAmount);
  
  // Create token instances
  const { token, weth } = await createTokens(tokenAddress, chainId);
  
  // Get pool contract
  const poolContract = await ethers.getContractAt(
    ["function factory() external view returns (address)",
     "function token0() external view returns (address)",
     "function token1() external view returns (address)",
     "function fee() external view returns (uint24)",
     "function tickSpacing() external view returns (int24)",
     "function maxLiquidityPerTick() external view returns (uint128)",
     "function liquidity() external view returns (uint128)",
     "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"],
    poolAddress
  );
  
  // Get pool data
  const [immutables, state] = await Promise.all([
    getPoolImmutables(poolContract),
    getPoolState(poolContract)
  ]);
  
  const [factory, token0Address, token1Address, fee, tickSpacing, maxLiquidityPerTick] = immutables;
  const [liquidity, slot0] = state;
  
  console.log("Pool token0:", token0Address);
  console.log("Pool token1:", token1Address);
  console.log("Current tick:", slot0.tick);
  console.log("Current sqrt price:", slot0.sqrtPriceX96.toString());
  
  // Determine token order
  const token0 = token0Address.toLowerCase() === token.address.toLowerCase() ? token : weth;
  const token1 = token0Address.toLowerCase() === token.address.toLowerCase() ? weth : token;
  
  // Create pool instance
  const poolSDK = new Pool(
    token0,
    token1,
    Number(fee),
    slot0.sqrtPriceX96.toString(),
    liquidity.toString(),
    Number(slot0.tick)
  );
  
  // Calculate tick range (±10% around current price)
  const { lowerTick, upperTick } = getTickRange(Number(slot0.tick), Number(tickSpacing), 10);
  
  console.log("Liquidity range:");
  console.log("Lower tick:", lowerTick);
  console.log("Upper tick:", upperTick);
  
  // Calculate desired amounts directly
  const amount0Desired = token0 === token ? 
    ethers.parseUnits(tokenAmount, token.decimals) : 
    ethers.parseEther(ethAmount);
  const amount1Desired = token1 === token ? 
    ethers.parseUnits(tokenAmount, token.decimals) : 
    ethers.parseEther(ethAmount);
  
  console.log("Required amounts:");
  console.log("Amount0 desired:", amount0Desired.toString());
  console.log("Amount1 desired:", amount1Desired.toString());
  
  // Get contracts
  const tokenContract = await ethers.getContractAt("MyToken", tokenAddress);
  const positionManager = await ethers.getContractAt(
    ["function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
     "function WETH9() external view returns (address)"],
    addresses.NONFUNGIBLE_POSITION_MANAGER
  );
  
  // Check balances
  const tokenBalance = await tokenContract.balanceOf(deployer.address);
  const ethBalance = await ethers.provider.getBalance(deployer.address);
  
  console.log("Current balances:");
  console.log("Token balance:", ethers.formatUnits(tokenBalance, token.decimals));
  console.log("ETH balance:", ethers.formatEther(ethBalance));
  
  // Check if we need WETH or if we can use ETH directly
  const wethContract = await ethers.getContractAt(
    ["function deposit() external payable",
     "function approve(address spender, uint256 amount) external returns (bool)",
     "function balanceOf(address owner) external view returns (uint256)"],
    addresses.WETH
  );
  
  const wethBalance = await wethContract.balanceOf(deployer.address);
  const requiredWeth = token0 === weth ? amount0Desired.toString() : amount1Desired.toString();
  
  console.log("WETH balance:", ethers.formatEther(wethBalance));
  console.log("Required WETH:", ethers.formatEther(requiredWeth));
  
  // Wrap ETH if needed
  if (wethBalance < BigInt(requiredWeth)) {
    const wrapAmount = BigInt(requiredWeth) - wethBalance;
    console.log("Wrapping ETH:", ethers.formatEther(wrapAmount));
    
    const wrapTx = await wethContract.deposit({ value: wrapAmount });
    await wrapTx.wait();
    console.log("ETH wrapped, transaction:", wrapTx.hash);
  }
  
  // Approve tokens
  console.log("Approving tokens...");
  
  const tokenApprovalTx = await tokenContract.approve(
    addresses.NONFUNGIBLE_POSITION_MANAGER,
    ethers.MaxUint256
  );
  await tokenApprovalTx.wait();
  console.log("Token approved, transaction:", tokenApprovalTx.hash);
  
  const wethApprovalTx = await wethContract.approve(
    addresses.NONFUNGIBLE_POSITION_MANAGER,
    ethers.MaxUint256
  );
  await wethApprovalTx.wait();
  console.log("WETH approved, transaction:", wethApprovalTx.hash);
  
  // Calculate minimum amounts (95% of desired amounts for 5% slippage tolerance)
  const amount0Min = (amount0Desired * 95n) / 100n;
  const amount1Min = (amount1Desired * 95n) / 100n;
  
  // Prepare mint parameters
  const mintParams = {
    token0: token0.address,
    token1: token1.address,
    fee: fee,
    tickLower: lowerTick,
    tickUpper: upperTick,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: amount0Min.toString(),
    amount1Min: amount1Min.toString(),
    recipient: deployer.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from now
  };
  
  console.log("Minting liquidity position...");
  console.log("Mint parameters:", {
    ...mintParams,
    amount0Desired: ethers.formatUnits(mintParams.amount0Desired, token0.decimals),
    amount1Desired: ethers.formatUnits(mintParams.amount1Desired, token1.decimals),
  });
  
  // Mint the position
  const mintTx = await positionManager.mint(mintParams);
  const mintReceipt = await mintTx.wait();
  
  console.log("Liquidity added successfully!");
  console.log("Transaction hash:", mintTx.hash);
  
  // Extract tokenId from logs
  const mintEvent = mintReceipt.logs.find(log => 
    log.address === addresses.NONFUNGIBLE_POSITION_MANAGER
  );
  
  if (mintEvent) {
    const iface = new ethers.Interface([
      "event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)"
    ]);
    
    try {
      const parsed = iface.parseLog(mintEvent);
      console.log("Position Token ID:", parsed.args.tokenId.toString());
      console.log("Liquidity added:", parsed.args.liquidity.toString());
      console.log("Amount0 used:", ethers.formatUnits(parsed.args.amount0, token0.decimals));
      console.log("Amount1 used:", ethers.formatUnits(parsed.args.amount1, token1.decimals));
    } catch (e) {
      console.log("Could not parse mint event");
    }
  }
  
  console.log("✅ Liquidity provision completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });