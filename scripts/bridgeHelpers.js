const { ethers } = require("hardhat");

// Base Bridge Contract Addresses
const BRIDGE_ADDRESSES = {
  ethereum: {
    L1_STANDARD_BRIDGE: "0x3154Cf16ccdb4C6d922629664174b904d80F2C35",
    L1_CROSS_DOMAIN_MESSENGER: "0x866E82a600A1414e583f7F13623F1aC5d58b0Afa",
    OPTIMISM_PORTAL: "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e",
    L2_OUTPUT_ORACLE: "0x56315b90c40730925ec5485cf004d835058518A0"
  },
  base: {
    L2_STANDARD_BRIDGE: "0x4200000000000000000000000000000000000010",
    L2_CROSS_DOMAIN_MESSENGER: "0x4200000000000000000000000000000000000007",
    L2_TO_L1_MESSAGE_PASSER: "0x4200000000000000000000000000000000000016"
  }
};

// Bridge timing constants
const BRIDGE_TIMINGS = {
  DEPOSIT_CONFIRMATION_BLOCKS: 64, // Ethereum blocks before deposit is confirmed on Base
  WITHDRAWAL_CHALLENGE_PERIOD: 7 * 24 * 60 * 60, // 7 days in seconds
  WITHDRAWAL_PROVE_PERIOD: 7 * 24 * 60 * 60 // 7 days to prove withdrawal
};

function getBridgeAddresses(network) {
  const addresses = BRIDGE_ADDRESSES[network];
  if (!addresses) {
    throw new Error(`Unsupported bridge network: ${network}`);
  }
  return addresses;
}

function calculateDepositETA(currentBlock, targetNetwork = "base") {
  // Estimate time for deposit to be available on Base
  const blocksRemaining = Math.max(0, BRIDGE_TIMINGS.DEPOSIT_CONFIRMATION_BLOCKS - 1);
  const estimatedMinutes = blocksRemaining * 0.2; // ~12 second Ethereum blocks
  return new Date(Date.now() + estimatedMinutes * 60 * 1000);
}

function calculateWithdrawalETA() {
  // Withdrawals have a 7-day challenge period
  return new Date(Date.now() + BRIDGE_TIMINGS.WITHDRAWAL_CHALLENGE_PERIOD * 1000);
}

async function waitForDepositConfirmation(txHash, provider) {
  console.log("Waiting for deposit confirmation...");
  const receipt = await provider.getTransactionReceipt(txHash);
  
  if (!receipt) {
    throw new Error("Transaction not found");
  }
  
  const currentBlock = await provider.getBlockNumber();
  const blocksToWait = BRIDGE_TIMINGS.DEPOSIT_CONFIRMATION_BLOCKS - (currentBlock - receipt.blockNumber);
  
  if (blocksToWait > 0) {
    console.log(`Waiting for ${blocksToWait} more blocks...`);
    // In a real implementation, you'd want to poll for new blocks
    console.log(`Estimated completion: ${calculateDepositETA(currentBlock)}`);
  } else {
    console.log("Deposit should be available on Base now!");
  }
  
  return receipt;
}

async function getDepositStatus(txHash, l1Provider, l2Provider) {
  try {
    const l1Receipt = await l1Provider.getTransactionReceipt(txHash);
    if (!l1Receipt) {
      return { status: "not_found", message: "Transaction not found on L1" };
    }
    
    const currentBlock = await l1Provider.getBlockNumber();
    const blocksConfirmed = currentBlock - l1Receipt.blockNumber;
    
    if (blocksConfirmed < BRIDGE_TIMINGS.DEPOSIT_CONFIRMATION_BLOCKS) {
      return {
        status: "pending",
        message: `Waiting for confirmation: ${blocksConfirmed}/${BRIDGE_TIMINGS.DEPOSIT_CONFIRMATION_BLOCKS} blocks`,
        blocksRemaining: BRIDGE_TIMINGS.DEPOSIT_CONFIRMATION_BLOCKS - blocksConfirmed,
        eta: calculateDepositETA(currentBlock)
      };
    }
    
    return {
      status: "ready",
      message: "Deposit should be available on Base",
      l1Receipt
    };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

async function getWithdrawalStatus(txHash, l2Provider) {
  try {
    const l2Receipt = await l2Provider.getTransactionReceipt(txHash);
    if (!l2Receipt) {
      return { status: "not_found", message: "Transaction not found on L2" };
    }
    
    // Parse withdrawal initiated event
    const withdrawalEvent = l2Receipt.logs.find(log => {
      try {
        // Look for WithdrawalInitiated event topic
        return log.topics[0] === "0x73d170910aba9e6d50b102db522b1dbcd796216f5128b445aa2135272886497e";
      } catch {
        return false;
      }
    });
    
    if (!withdrawalEvent) {
      return { status: "error", message: "Withdrawal event not found in transaction" };
    }
    
    return {
      status: "initiated",
      message: "Withdrawal initiated, challenge period in progress",
      challengeEndTime: calculateWithdrawalETA(),
      l2Receipt
    };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

// Standard Bridge ABI fragments
const L1_STANDARD_BRIDGE_ABI = [
  "function depositERC20(address _l1Token, address _l2Token, uint256 _amount, uint32 _l2Gas, bytes calldata _data) external",
  "function finalizeERC20Withdrawal(address _l1Token, address _l2Token, address _from, address _to, uint256 _amount, bytes calldata _data) external",
  "event ERC20DepositInitiated(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data)"
];

const L2_STANDARD_BRIDGE_ABI = [
  "function withdraw(address _l2Token, uint256 _amount, uint32 _l1Gas, bytes calldata _data) external",
  "function withdrawTo(address _l2Token, address _to, uint256 _amount, uint32 _l1Gas, bytes calldata _data) external",
  "event WithdrawalInitiated(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data)"
];

module.exports = {
  BRIDGE_ADDRESSES,
  BRIDGE_TIMINGS,
  getBridgeAddresses,
  calculateDepositETA,
  calculateWithdrawalETA,
  waitForDepositConfirmation,
  getDepositStatus,
  getWithdrawalStatus,
  L1_STANDARD_BRIDGE_ABI,
  L2_STANDARD_BRIDGE_ABI
};