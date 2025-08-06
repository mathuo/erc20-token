const { ethers } = require("hardhat");

async function main() {
  // Base Sepolia token
  const baseProvider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const baseToken = new ethers.Contract('0xE41b45f227134A8cA5fd19CB2c263d27e0cE533B', ['function totalSupply() view returns (uint256)'], baseProvider);
  const baseTotalSupply = await baseToken.totalSupply();
  
  // Ethereum Sepolia token  
  const sepoliaProvider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
  const sepoliaToken = new ethers.Contract('0xD763F2ac003fbe23Ba2A10fc9Ef1037cB4721308', ['function totalSupply() view returns (uint256)'], sepoliaProvider);
  const sepoliaTotalSupply = await sepoliaToken.totalSupply();
  
  console.log('📊 Token Circulation Summary');
  console.log('============================');
  console.log('Base Sepolia Total Supply:', ethers.formatEther(baseTotalSupply), 'MTK');
  console.log('Ethereum Sepolia Total Supply:', ethers.formatEther(sepoliaTotalSupply), 'MTK');
  console.log('Total Circulation:', ethers.formatEther(baseTotalSupply + sepoliaTotalSupply), 'MTK');
}

main().catch(console.error);