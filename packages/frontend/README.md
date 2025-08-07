# 🖥️ DeFi Token Suite - Frontend

Modern web interface for multi-network token claiming built with Next.js 14.

## ✨ Features

- 🔗 **Multi-Wallet Support**: MetaMask, WalletConnect, Coinbase Wallet, and more via RainbowKit
- 🌐 **Multi-Network**: Ethereum, Base, Sepolia, Base Sepolia with automatic switching
- 🎁 **Public Airdrop Interface**: Claim tokens from any active campaigns
- 💰 **Real-time Balance**: Live token balance and transaction monitoring
- 🎨 **Modern UI**: Responsive design with dark mode support
- 📱 **Mobile First**: Optimized for all screen sizes
- ⚡ **Fast & Reliable**: Built with Web3 best practices

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi + Viem + Ethers.js
- **Wallet Connect**: RainbowKit
- **State Management**: TanStack Query
- **UI Components**: Custom components + Radix UI
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 8+
- A Web3 wallet (MetaMask recommended)
- WalletConnect Project ID

### Installation

```bash
# From monorepo root
npm run install:frontend

# Or from this directory
npm install
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
```

**Required environment variables:**

```bash
# WalletConnect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id

# App Configuration
NEXT_PUBLIC_APP_NAME=DeFi Token Suite

# Contract addresses (populated after contract deployment)
NEXT_PUBLIC_TOKEN_ADDRESS_ETHEREUM=0x...
NEXT_PUBLIC_PUBLIC_AIRDROP_ADDRESS_ETHEREUM=0x...
# ... (see .env.example for all networks)
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

## 📱 User Interface

### 🏠 Main Features

1. **Wallet Connection**
   - Multi-wallet support via RainbowKit
   - Automatic network detection
   - Balance display and account management

2. **Network Selection**
   - Visual network selector with icons
   - Automatic contract address resolution
   - Testnet/mainnet distinction

3. **Campaign Discovery**
   - Automatic detection of active campaigns
   - Real-time campaign status updates
   - Progress tracking and time remaining

4. **Token Claiming**
   - One-click claim functionality
   - Transaction status monitoring
   - Success/error handling with notifications

### 🎨 Design System

The interface uses a custom design system built with Tailwind CSS:

- **Colors**: Blue-purple gradient theme with dark mode
- **Typography**: Inter font with hierarchical text scales
- **Components**: Consistent button styles, cards, and badges
- **Animations**: Subtle transitions and loading states

### 📊 Campaign Cards

Each campaign displays:
- Campaign name and ID
- Claim amount and remaining tokens
- Progress bar showing distribution
- User-specific claim status
- Time remaining and cooldown periods
- Real-time claim eligibility

## 🔧 Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Main airdrop interface
├── components/
│   ├── providers/          # Web3 providers setup
│   ├── web3/              # Wallet & network components
│   ├── airdrop/           # Campaign-specific components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
│   └── usePublicAirdrop.ts # Main airdrop contract hook
├── lib/
│   ├── wagmi/             # Wagmi configuration
│   ├── contracts/         # Contract ABIs and addresses
│   └── utils.ts           # Utility functions
└── styles/
    └── globals.css        # Global styles and design system
```

### Custom Hooks

#### `usePublicAirdrop()`
Main hook for interacting with airdrop contracts:
```typescript
const {
  contractAddress,      // Current network contract
  tokenAddress,        // Token contract address  
  tokenSymbol,         // Token symbol (e.g., 'MTK')
  activeCampaigns,     // Array of active campaign IDs
  isLoadingCampaigns,  // Loading state
  refetchCampaigns,    // Refresh function
} = usePublicAirdrop();
```

#### `useCampaignInfo(campaignId)`
Get detailed information about a specific campaign:
```typescript
const { campaignInfo, isLoading } = useCampaignInfo(campaignId);
// campaignInfo includes: name, amounts, timing, status
```

#### `useClaimTokens()`
Handle token claiming with transaction monitoring:
```typescript
const {
  claim,              // Claim function
  isPending,          // Transaction pending
  isConfirmed,        // Transaction confirmed
  error,              // Any errors
} = useClaimTokens();
```

### Component Architecture

#### Network-Aware Components
All components automatically adapt to the current network:
- Contract addresses are resolved per network
- Network-specific styling and messaging
- Graceful handling of unsupported networks

#### Real-Time Updates
Components use React Query for efficient data fetching:
- Automatic background refetching
- Optimistic updates after transactions
- Error retry with exponential backoff

### Web3 Integration

#### Wagmi Configuration
```typescript
// Multi-chain support with custom RPC providers
const config = getDefaultConfig({
  appName: 'DeFi Token Suite',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  chains: [mainnet, base, sepolia, baseSepolia],
  ssr: true,
});
```

#### Contract Interactions
Type-safe contract calls using generated ABIs:
```typescript
const { data: campaigns } = useReadContract({
  address: contractAddress,
  abi: PublicAirdropABI,
  functionName: 'getActiveCampaigns',
});
```

## 🚀 Deployment

### Build Production

```bash
npm run build
```

### Deploy to Vercel (Recommended)

1. Push to GitHub repository
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

```bash
# Or use Vercel CLI
npm i -g vercel
vercel --prod
```

### Environment Variables for Production

Set these in your deployment platform:

```bash
NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_TOKEN_ADDRESS_ETHEREUM=0x_deployed_token_address
NEXT_PUBLIC_PUBLIC_AIRDROP_ADDRESS_ETHEREUM=0x_deployed_airdrop_address
# ... (repeat for all networks)
```

## 🧪 Testing

### Run Tests

```bash
npm test                 # All tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Manual Testing Checklist

1. **Wallet Connection**
   - [ ] Connect with MetaMask
   - [ ] Connect with WalletConnect
   - [ ] Network switching works
   - [ ] Disconnect/reconnect flows

2. **Network Support**
   - [ ] Ethereum mainnet
   - [ ] Base mainnet  
   - [ ] Sepolia testnet
   - [ ] Base Sepolia testnet
   - [ ] Unsupported networks show warning

3. **Campaign Interaction**
   - [ ] Campaigns load correctly
   - [ ] User status shows accurately
   - [ ] Claim button enables/disables properly
   - [ ] Transaction flows work end-to-end

4. **Error Handling**
   - [ ] Network errors display properly
   - [ ] Transaction failures show details
   - [ ] Loading states work correctly
   - [ ] Retry mechanisms function

## 🔍 Troubleshooting

### Common Issues

**"Cannot connect to wallet"**
- Ensure wallet is installed and unlocked
- Check WalletConnect Project ID
- Try refreshing the page

**"No campaigns found"**
- Verify contract addresses in environment
- Check you're on correct network
- Ensure campaigns exist on that network

**"Transaction failed"**
- Check wallet has sufficient ETH for gas
- Verify eligibility requirements are met
- Try increasing gas limit

**"Contract not found"**
- Verify contract addresses are correct
- Ensure contracts are deployed on current network
- Check environment variables are set

### Debug Mode

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('debug', 'wagmi:*');
// Then refresh page
```

### Network Configuration

Verify your network configuration matches deployed contracts:
```typescript
// Check current addresses
console.log('Current network:', chainId);
console.log('Token address:', getContractAddress(chainId, 'MyToken'));
console.log('Airdrop address:', getContractAddress(chainId, 'PublicAirdrop'));
```

## 📖 Usage Guide

### For Users

1. **Connect Wallet**: Click "Connect Wallet" and choose your preferred wallet
2. **Select Network**: Use the network selector to choose your desired blockchain
3. **View Campaigns**: Active campaigns will appear as cards showing details
4. **Check Eligibility**: Each card shows if you can claim and any requirements
5. **Claim Tokens**: Click "Claim" button and confirm the transaction
6. **Monitor Status**: Transaction status appears with links to block explorer

### For Developers

1. **Deploy Contracts**: Deploy token and airdrop contracts using the contracts package
2. **Update Addresses**: Add contract addresses to environment variables
3. **Create Campaigns**: Use contract scripts to create public campaigns
4. **Monitor Activity**: Frontend automatically displays active campaigns

## 🤝 Contributing

1. Follow existing code patterns and TypeScript usage
2. Add tests for new components and hooks
3. Update documentation for new features
4. Test on multiple networks before submitting PR

## 📄 License

MIT License - see root LICENSE file for details.