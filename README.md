# Ethereum & Base DeFi Token Suite

A comprehensive ERC-20 token implementation with advanced DeFi features, deployable on Ethereum and Base networks. This project includes token deployment, Uniswap V3 liquidity management, cross-chain bridging, and treasury management tools.

## 🚀 Features

### Token Features
- **ERC-20 Standard**: Full compliance with ERC-20 token standard
- **OpenZeppelin Integration**: Built with battle-tested OpenZeppelin contracts
- **Multi-Network Support**: Deploy on Ethereum mainnet, Sepolia testnet, Base mainnet, and Base Sepolia testnet
- **Mintable**: Owner can mint new tokens
- **Burnable**: Users can burn their own tokens
- **Permit Support**: EIP-2612 permit functionality for gasless approvals
- **Ownable**: Access control for administrative functions

### DeFi Integrations
- **Uniswap V3 Integration**: Create pools and manage liquidity positions
- **Cross-Chain Bridging**: Bridge tokens between Ethereum and Base
- **Treasury Management**: Advanced treasury operations and monitoring
- **Liquidity Management**: Add, remove, and optimize liquidity positions
- **Trading Tools**: Swap functionality and pool visualization

### Advanced Scripts
- **Pool Management**: Create pools, add/remove liquidity, visualize positions
- **Bridge Operations**: Deposit, withdraw, status checking, and finalization
- **Trading Tools**: Execute swaps, test trades, and analyze pool data
- **Monitoring**: Check balances, circulation, and cross-network comparisons

## 📋 Contract Configuration

- **Name**: MyToken (configurable via .env)
- **Symbol**: MTK (configurable via .env)
- **Decimals**: 18
- **Max Supply**: 1,000,000,000 tokens (configurable)
- **Initial Supply**: 200,000,000 tokens (configurable)
- **Minting**: Only owner can mint new tokens
- **Burning**: Any user can burn their tokens or approved tokens

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` file with your configuration:
   - Add your private key (without 0x prefix)
   - Add RPC URLs for networks you want to use
   - Add API keys for contract verification

## 🛠 Usage

### Basic Operations

#### Compile Contracts
```bash
npm run compile
```

#### Run Tests
```bash
npm run test
```

### 📱 Token Deployment

#### Local Development
```bash
npx hardhat node
npm run deploy:localhost
```

#### Production Networks
```bash
# Ethereum Mainnet
npm run deploy:ethereum

# Base Mainnet
npm run deploy:base
```

#### Test Networks
```bash
# Sepolia Testnet
npm run deploy:sepolia

# Base Sepolia Testnet
npm run deploy:base-sepolia
```

### 🏊 Liquidity Management

#### Create Uniswap V3 Pool
```bash
# Create pool on Base
npm run create-pool:base

# Create pool on Ethereum
npm run create-pool:ethereum
```

#### Add Liquidity
```bash
# Add liquidity on Base
npm run add-liquidity:base

# Add liquidity on Ethereum
npm run add-liquidity:ethereum
```

#### Remove Liquidity
```bash
# Remove liquidity on Base
npm run remove-liquidity:base

# Remove liquidity on Ethereum
npm run remove-liquidity:ethereum
```

### 🌉 Cross-Chain Bridge Operations

#### Bridge from Ethereum to Base
```bash
npm run bridge-deposit
```

#### Bridge from Base to Ethereum
```bash
npm run bridge-withdraw
```

#### Check Bridge Status
```bash
npm run bridge-status
```

#### Finalize Bridge Transaction
```bash
npm run bridge-finalize
```

### 🏛 Treasury Management
```bash
npm run treasury
```

### 📊 Advanced Scripts

The project includes many specialized scripts in the `scripts/` directory:

- **Pool Analysis**: `visualizePool.js`, `checkPoolLiquidity.js`
- **Trading**: `simpleSwap.js`, `testTrade.js`, `executeProperSwap.js`
- **Monitoring**: `checkCirculation.js`, `compareNetworks.js`, `checkSepoliaBalance.js`
- **Liquidity Optimization**: `addLiquidityFixed.js`, `addMinimalLiquidity.js`, `debugLiquidity.js`

## Network Configuration

The project is configured for the following networks:

- **Ethereum Mainnet** (Chain ID: 1)
- **Sepolia Testnet** (Chain ID: 11155111)
- **Base Mainnet** (Chain ID: 8453)
- **Base Sepolia Testnet** (Chain ID: 84532)

## Contract Verification

The deployment script automatically attempts to verify contracts on Etherscan/Basescan after deployment. Make sure to set the appropriate API keys in your `.env` file.

## Security Considerations

- Never commit your private key or `.env` file to version control
- Test thoroughly on testnets before mainnet deployment
- Consider using a hardware wallet or multisig for production deployments
- Audit your contracts before deploying significant value

## ⚙️ Configuration

### Environment Variables

Key configuration variables in `.env`:

- **Token Configuration**: `TOKEN_NAME`, `TOKEN_SYMBOL`, `MAX_SUPPLY`, `INITIAL_SUPPLY`
- **Network RPC URLs**: `ETHEREUM_RPC_URL`, `BASE_RPC_URL`, `SEPOLIA_RPC_URL`, `BASE_SEPOLIA_RPC_URL`
- **API Keys**: `ETHERSCAN_API_KEY`, `BASESCAN_API_KEY`
- **Uniswap Settings**: `TOKEN_ADDRESS`, `POOL_ADDRESS`, `INITIAL_PRICE`, `TOKEN_AMOUNT`, `ETH_AMOUNT`
- **Bridge Settings**: `L1_TOKEN_ADDRESS`, `L2_TOKEN_ADDRESS`, `BRIDGE_AMOUNT`
- **Treasury Addresses**: `TREASURY_ADDRESS`, `FEE_RECIPIENT`, `INITIAL_OWNER`

### Customization

To customize the project:

1. **Token Contract**: Edit `contracts/MyToken.sol` to modify token features
2. **Deployment**: Update `scripts/deploy.js` for custom deployment parameters
3. **Tests**: Add tests in `test/MyToken.test.js` or create new test files
4. **Scripts**: Modify existing scripts or create new ones for specific operations
5. **Networks**: Add new networks in `hardhat.config.js`

## 📁 Project Structure

```
├── contracts/          # Smart contracts
├── scripts/           # Deployment and utility scripts
│   ├── deploy.js      # Main deployment script
│   ├── createPool.js  # Uniswap pool creation
│   ├── bridge*.js     # Cross-chain bridge operations
│   ├── *Liquidity.js  # Liquidity management
│   └── treasury*.js   # Treasury operations
├── test/             # Contract tests
├── hardhat.config.js # Hardhat configuration
├── .env.example      # Environment template
└── package.json      # Dependencies and scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details