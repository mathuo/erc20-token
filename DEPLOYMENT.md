# Deployment Guide

This repository is configured to automatically deploy the frontend to GitHub Pages whenever changes are pushed to the main branch.

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

### 2. Configure Environment Variables (Optional)

You can override the default contract addresses by setting repository variables:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click on the **Variables** tab
3. Add these variables (optional - defaults are already set):

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `TOKEN_ADDRESS_BASE_SEPOLIA` | Base Sepolia token contract address | `0xCD868868d558e610091a249451ce95689038b421` |
| `PUBLIC_AIRDROP_ADDRESS_BASE_SEPOLIA` | Base Sepolia airdrop contract address | `0x84ed9cFaBC7639bfd4e1771E71387e394e16762b` |
| `WALLETCONNECT_PROJECT_ID` | Your WalletConnect Project ID | `b084a5e67fd143b7a3314c58b954ea48` |

### 3. Deploy

The deployment will happen automatically when you:
- Push changes to the `main` or `master` branch that affect the frontend
- Manually trigger the workflow from the **Actions** tab

### 4. Access Your Site

After deployment, your site will be available at:
```
https://[your-username].github.io/[repository-name]/
```

## Manual Deployment

You can also manually trigger a deployment:

1. Go to the **Actions** tab in your repository
2. Click on **Deploy to GitHub Pages**
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

## Local Development

To run the frontend locally:

```bash
cd packages/frontend
npm install
npm run dev
```

To build and test the static export locally:

```bash
cd packages/frontend
npm run build
# Static files will be in the 'out' directory
```

## Updating Contract Addresses

### Method 1: Repository Variables (Recommended)
Update the variables in GitHub Settings → Secrets and variables → Actions → Variables

### Method 2: Edit Workflow File
Update the environment variables in `.github/workflows/deploy.yml`

### Method 3: Edit .env File
Update `packages/frontend/.env` and push changes (the workflow will use these as fallbacks)

## Troubleshooting

### Build Failures
- Check the Actions tab for detailed error logs
- Ensure all dependencies are properly listed in package.json
- Verify that the frontend builds successfully locally

### Page Not Loading
- Check that GitHub Pages is enabled in repository settings
- Verify the deployment completed successfully in the Actions tab
- Check browser console for any errors

### Contract Connection Issues
- Ensure contract addresses are correct for the target network
- Verify contracts are deployed and accessible
- Check that users are connected to the correct network (Base Sepolia)

## Security Notes

All environment variables starting with `NEXT_PUBLIC_` are baked into the static build and are publicly visible. This is normal and expected for Web3 frontends:

- ✅ Contract addresses (public on blockchain anyway)
- ✅ WalletConnect Project ID (meant to be public)
- ✅ App configuration (display names, etc.)
- ❌ No private keys or sensitive data is included

The frontend is a client-side only application that connects to smart contracts through users' wallets.