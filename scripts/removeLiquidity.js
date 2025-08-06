const { ethers } = require("hardhat");
const { getNetworkAddresses } = require("./uniswapHelpers");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Removing liquidity with account:", deployer.address);
  
  // Get network chain ID
  const chainId = await deployer.getChainId();
  const addresses = getNetworkAddresses(chainId);
  
  console.log("Network:", chainId === 1 ? "Ethereum Mainnet" : chainId === 8453 ? "Base Mainnet" : `Chain ID ${chainId}`);
  
  // Get parameters
  const tokenId = process.env.TOKEN_ID || process.argv[2];
  const liquidityPercentage = process.env.LIQUIDITY_PERCENTAGE || process.argv[3] || "100"; // Default 100%
  
  if (!tokenId) {
    throw new Error("Please provide TOKEN_ID");
  }
  
  console.log("Position Token ID:", tokenId);
  console.log("Removing", liquidityPercentage + "% of liquidity");
  
  // Get position manager contract
  const positionManager = await ethers.getContractAt([
    "function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
    "function decreaseLiquidity((uint256 tokenId, uint128 liquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline)) external payable returns (uint256 amount0, uint256 amount1)",
    "function collect((uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max)) external payable returns (uint256 amount0, uint256 amount1)",
    "function burn(uint256 tokenId) external payable",
    "function ownerOf(uint256 tokenId) external view returns (address)"
  ], addresses.NONFUNGIBLE_POSITION_MANAGER);
  
  // Check ownership
  const owner = await positionManager.ownerOf(tokenId);
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    throw new Error(`You don't own this position. Owner: ${owner}`);
  }
  
  // Get position data
  const position = await positionManager.positions(tokenId);
  const {
    token0,
    token1,
    fee,
    tickLower,
    tickUpper,
    liquidity,
    tokensOwed0,
    tokensOwed1
  } = position;
  
  console.log("Position details:");
  console.log("Token0:", token0);
  console.log("Token1:", token1);
  console.log("Fee:", fee);
  console.log("Tick range:", tickLower, "to", tickUpper);
  console.log("Current liquidity:", liquidity.toString());
  console.log("Tokens owed0:", tokensOwed0.toString());
  console.log("Tokens owed1:", tokensOwed1.toString());
  
  if (liquidity.eq(0)) {
    console.log("No liquidity to remove");
    
    // Still collect any fees owed
    if (tokensOwed0.gt(0) || tokensOwed1.gt(0)) {
      console.log("Collecting fees...");
      const collectTx = await positionManager.collect({
        tokenId: tokenId,
        recipient: deployer.address,
        amount0Max: ethers.constants.MaxUint128,
        amount1Max: ethers.constants.MaxUint128
      });
      await collectTx.wait();
      console.log("Fees collected, transaction:", collectTx.hash);
    }
    
    return;
  }
  
  // Calculate liquidity to remove
  const liquidityToRemove = liquidity.mul(liquidityPercentage).div(100);
  
  console.log("Liquidity to remove:", liquidityToRemove.toString());
  
  // Set minimum amounts (95% for 5% slippage tolerance)
  const amount0Min = 0; // You might want to calculate this based on current pool price
  const amount1Min = 0; // You might want to calculate this based on current pool price
  
  // Decrease liquidity
  console.log("Decreasing liquidity...");
  const decreaseTx = await positionManager.decreaseLiquidity({
    tokenId: tokenId,
    liquidity: liquidityToRemove,
    amount0Min: amount0Min,
    amount1Min: amount1Min,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from now
  });
  
  const decreaseReceipt = await decreaseTx.wait();
  console.log("Liquidity decreased, transaction:", decreaseTx.hash);
  
  // Parse the decrease event to get amounts
  const decreaseEvent = decreaseReceipt.logs.find(log => 
    log.topics[0] === ethers.utils.id("DecreaseLiquidity(uint256,uint128,uint256,uint256)")
  );
  
  if (decreaseEvent) {
    const decoded = ethers.utils.defaultAbiCoder.decode(
      ["uint128", "uint256", "uint256"],
      decreaseEvent.data
    );
    console.log("Liquidity removed:", decoded[0].toString());
    console.log("Amount0 received:", decoded[1].toString());
    console.log("Amount1 received:", decoded[2].toString());
  }
  
  // Collect the tokens (including any fees)
  console.log("Collecting tokens...");
  const collectTx = await positionManager.collect({
    tokenId: tokenId,
    recipient: deployer.address,
    amount0Max: ethers.constants.MaxUint128,
    amount1Max: ethers.constants.MaxUint128
  });
  
  const collectReceipt = await collectTx.wait();
  console.log("Tokens collected, transaction:", collectTx.hash);
  
  // Parse the collect event
  const collectEvent = collectReceipt.logs.find(log => 
    log.topics[0] === ethers.utils.id("Collect(uint256,address,uint256,uint256)")
  );
  
  if (collectEvent) {
    const decoded = ethers.utils.defaultAbiCoder.decode(
      ["address", "uint256", "uint256"],
      collectEvent.data
    );
    console.log("Amount0 collected:", decoded[1].toString());
    console.log("Amount1 collected:", decoded[2].toString());
  }
  
  // If removing 100% liquidity, burn the NFT
  if (liquidityPercentage === "100") {
    console.log("Burning position NFT...");
    const burnTx = await positionManager.burn(tokenId);
    await burnTx.wait();
    console.log("Position NFT burned, transaction:", burnTx.hash);
  }
  
  console.log("✅ Liquidity removal completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });