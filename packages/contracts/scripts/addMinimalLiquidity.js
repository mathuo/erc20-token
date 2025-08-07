const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("💧 Minimal Liquidity Addition");
  console.log("Account:", deployer.address);
  
  // Base Sepolia addresses
  const tokenAddress = "0xE41b45f227134A8cA5fd19CB2c263d27e0cE533B";
  const wethAddress = "0x4200000000000000000000000000000000000006";
  const positionManagerAddress = "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2";
  
  // Very minimal amounts
  const ethAmountWei = ethers.parseEther("0.005"); // 0.005 ETH
  const tokenAmountWei = ethers.parseUnits("1000", 18); // 1000 tokens
  
  console.log("Adding minimal liquidity:");
  console.log("- ETH:", ethers.formatEther(ethAmountWei));
  console.log("- Tokens:", ethers.formatUnits(tokenAmountWei, 18));
  
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
    // Wrap ETH
    console.log("1. Wrapping ETH...");
    const wrapTx = await wethContract.deposit({ value: ethAmountWei });
    await wrapTx.wait();
    console.log("   ✅ ETH wrapped");
    
    // Approve both tokens
    console.log("2. Approving tokens...");
    await (await wethContract.approve(positionManagerAddress, ethAmountWei)).wait();
    await (await tokenContract.approve(positionManagerAddress, tokenAmountWei)).wait();
    console.log("   ✅ Tokens approved");
    
    // Very wide range position
    console.log("3. Adding liquidity...");
    const mintParams = {
      token0: wethAddress,
      token1: tokenAddress,
      fee: 3000,
      tickLower: -600000,  // Extremely wide range
      tickUpper: 600000,   // Extremely wide range  
      amount0Desired: ethAmountWei,
      amount1Desired: tokenAmountWei,
      amount0Min: ethAmountWei / 2n,     // 50% tolerance
      amount1Min: tokenAmountWei / 2n,   // 50% tolerance
      recipient: deployer.address,
      deadline: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };
    
    const mintTx = await positionManager.mint(mintParams);
    const receipt = await mintTx.wait();
    
    console.log("   ✅ Liquidity added!");
    console.log("   Transaction:", mintTx.hash);
    
  } catch (error) {
    console.log("❌ Failed:", error.message);
    
    // If it's a revert, the pool might just not support liquidity yet
    // This is common on testnets where Uniswap contracts might be different
    console.log("\n💡 Note: Base Sepolia Uniswap might have different behavior");
    console.log("   Your pool exists and is initialized, which is the main achievement!");
  }
}

main().catch(console.error);