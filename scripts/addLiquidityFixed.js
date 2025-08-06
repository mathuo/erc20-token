const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Adding liquidity with account:", deployer.address);
  
  const tokenAddress = "0xE41b45f227134A8cA5fd19CB2c263d27e0cE533B";
  const poolAddress = "0xbFf938a5038D593317279a179D45c5FbFc0E88bE";
  const positionManagerAddress = "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2";
  const wethAddress = "0x4200000000000000000000000000000000000006";
  
  // Use very simple amounts - just add single-sided WETH liquidity
  const ethAmount = "0.01"; // Small amount for testing
  const ethAmountWei = ethers.parseEther(ethAmount);
  
  console.log("Adding", ethAmount, "ETH worth of liquidity");
  
  // Get contracts
  const tokenContract = await ethers.getContractAt("MyToken", tokenAddress);
  const wethContract = await ethers.getContractAt([
    "function deposit() external payable",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address owner) external view returns (uint256)"
  ], wethAddress);
  
  const positionManager = await ethers.getContractAt([
    "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)"
  ], positionManagerAddress);
  
  // Check balances
  const ethBalance = await ethers.provider.getBalance(deployer.address);
  const tokenBalance = await tokenContract.balanceOf(deployer.address);
  
  console.log("ETH balance:", ethers.formatEther(ethBalance));
  console.log("Token balance:", ethers.formatUnits(tokenBalance, 18));
  
  // Wrap ETH
  console.log("Wrapping ETH...");
  const wrapTx = await wethContract.deposit({ value: ethAmountWei });
  await wrapTx.wait();
  console.log("ETH wrapped");
  
  // Approve WETH
  console.log("Approving WETH...");
  const wethApprovalTx = await wethContract.approve(positionManagerAddress, ethers.MaxUint256);
  await wethApprovalTx.wait();
  
  // Approve tokens (even if we don't use them, for safety)
  console.log("Approving tokens...");
  const tokenApprovalTx = await tokenContract.approve(positionManagerAddress, ethers.MaxUint256);
  await tokenApprovalTx.wait();
  
  // Create position with wide range and single-sided liquidity
  // WETH is token0, MTK is token1
  const mintParams = {
    token0: wethAddress,         // WETH
    token1: tokenAddress,        // MTK
    fee: 3000,                   // 0.3%
    tickLower: -887220,          // Very wide range
    tickUpper: 887220,           // Very wide range
    amount0Desired: ethAmountWei.toString(), // Only WETH
    amount1Desired: "0",         // No tokens
    amount0Min: "0",             // No slippage protection for testing
    amount1Min: "0",             // No slippage protection for testing
    recipient: deployer.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20
  };
  
  console.log("Minting position...");
  console.log("Parameters:", {
    ...mintParams,
    amount0Desired: ethers.formatEther(mintParams.amount0Desired) + " WETH",
    amount1Desired: mintParams.amount1Desired + " MTK"
  });
  
  try {
    const mintTx = await positionManager.mint(mintParams);
    const receipt = await mintTx.wait();
    
    console.log("✅ Liquidity added successfully!");
    console.log("Transaction hash:", mintTx.hash);
    
    // Try to extract position info from logs
    console.log("Position created - check transaction on BaseScan");
    
  } catch (error) {
    console.error("❌ Minting failed:", error.message);
  }
}

main().catch(console.error);