const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Exporting contract ABIs...");
  
  const artifactsDir = path.join(__dirname, "../artifacts/contracts");
  const outputDir = path.join(__dirname, "../../frontend/src/lib/abis");
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Contract names to export
  const contracts = [
    "MyToken",
    "BatchAirdrop", 
    "MerkleAirdrop",
    "PublicAirdrop",
    "ConditionalAirdrop",
    "SwapHelper"
  ];
  
  const exportedABIs = {};
  
  for (const contractName of contracts) {
    try {
      const artifactPath = path.join(artifactsDir, `${contractName}.sol`, `${contractName}.json`);
      
      if (fs.existsSync(artifactPath)) {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        
        // Export individual ABI file
        const abiPath = path.join(outputDir, `${contractName}.json`);
        fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
        
        // Add to combined export
        exportedABIs[contractName] = artifact.abi;
        
        console.log(`✅ Exported ${contractName} ABI`);
      } else {
        console.log(`⚠️  ${contractName} artifact not found, skipping...`);
      }
    } catch (error) {
      console.error(`❌ Error exporting ${contractName}:`, error.message);
    }
  }
  
  // Create combined ABI export
  const indexPath = path.join(outputDir, "index.ts");
  const indexContent = `// Auto-generated ABI exports
// Run 'npm run export-abis' in contracts package to regenerate

${Object.keys(exportedABIs).map(name => 
  `import ${name}ABI from './${name}.json'`
).join('\n')}

export const ABIs = {
${Object.keys(exportedABIs).map(name => 
  `  ${name}: ${name}ABI`
).join(',\n')}
} as const

export type ContractName = keyof typeof ABIs

// Individual exports for convenience
${Object.keys(exportedABIs).map(name => 
  `export { default as ${name}ABI } from './${name}.json'`
).join('\n')}

// Type exports
export type {
  MyToken,
  BatchAirdrop,
  MerkleAirdrop, 
  PublicAirdrop,
  ConditionalAirdrop,
  SwapHelper
} from '../types/contracts'
`;

  fs.writeFileSync(indexPath, indexContent);
  
  // Create contract addresses file
  const addressesPath = path.join(__dirname, "../../frontend/src/lib/contracts/addresses.ts");
  const addressesDir = path.dirname(addressesPath);
  
  if (!fs.existsSync(addressesDir)) {
    fs.mkdirSync(addressesDir, { recursive: true });
  }
  
  const addressesContent = `// Contract addresses by network
// Update these after deployment

export const CONTRACT_ADDRESSES = {
  // Ethereum Mainnet
  1: {
    MyToken: process.env.NEXT_PUBLIC_TOKEN_ADDRESS_ETHEREUM || '',
    BatchAirdrop: process.env.NEXT_PUBLIC_BATCH_AIRDROP_ADDRESS_ETHEREUM || '',
    MerkleAirdrop: process.env.NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS_ETHEREUM || '',
    PublicAirdrop: process.env.NEXT_PUBLIC_PUBLIC_AIRDROP_ADDRESS_ETHEREUM || '',
  },
  
  // Base Mainnet  
  8453: {
    MyToken: process.env.NEXT_PUBLIC_TOKEN_ADDRESS_BASE || '',
    BatchAirdrop: process.env.NEXT_PUBLIC_BATCH_AIRDROP_ADDRESS_BASE || '',
    MerkleAirdrop: process.env.NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS_BASE || '',
    PublicAirdrop: process.env.NEXT_PUBLIC_PUBLIC_AIRDROP_ADDRESS_BASE || '',
  },
  
  // Sepolia Testnet
  11155111: {
    MyToken: process.env.NEXT_PUBLIC_TOKEN_ADDRESS_SEPOLIA || '',
    BatchAirdrop: process.env.NEXT_PUBLIC_BATCH_AIRDROP_ADDRESS_SEPOLIA || '',
    MerkleAirdrop: process.env.NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS_SEPOLIA || '',
    PublicAirdrop: process.env.NEXT_PUBLIC_PUBLIC_AIRDROP_ADDRESS_SEPOLIA || '',
  },
  
  // Base Sepolia Testnet
  84532: {
    MyToken: process.env.NEXT_PUBLIC_TOKEN_ADDRESS_BASE_SEPOLIA || '',
    BatchAirdrop: process.env.NEXT_PUBLIC_BATCH_AIRDROP_ADDRESS_BASE_SEPOLIA || '',
    MerkleAirdrop: process.env.NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS_BASE_SEPOLIA || '',
    PublicAirdrop: process.env.NEXT_PUBLIC_PUBLIC_AIRDROP_ADDRESS_BASE_SEPOLIA || '',
  },
  
  // Localhost
  31337: {
    MyToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // First Hardhat contract
    BatchAirdrop: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    MerkleAirdrop: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', 
    PublicAirdrop: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  }
} as const

export type ChainId = keyof typeof CONTRACT_ADDRESSES
export type ContractName = keyof typeof CONTRACT_ADDRESSES[ChainId]

export function getContractAddress(chainId: ChainId, contractName: ContractName): string {
  const address = CONTRACT_ADDRESSES[chainId]?.[contractName]
  if (!address) {
    console.warn(\`No address found for \${contractName} on chain \${chainId}\`)
  }
  return address || ''
}

// Network names
export const NETWORK_NAMES = {
  1: 'Ethereum',
  8453: 'Base',
  11155111: 'Sepolia',
  84532: 'Base Sepolia',
  31337: 'Localhost'
} as const
`;

  fs.writeFileSync(addressesPath, addressesContent);
  
  console.log(`\n📋 Export Summary:`);
  console.log(`Exported ${Object.keys(exportedABIs).length} contract ABIs`);
  console.log(`ABIs saved to: ${outputDir}`);
  console.log(`Index file: ${indexPath}`);
  console.log(`Addresses file: ${addressesPath}`);
  console.log(`\n✅ ABI export complete!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ ABI export failed:", error);
    process.exit(1);
  });