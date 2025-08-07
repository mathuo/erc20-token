// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PublicAirdrop.sol";

contract ConditionalAirdrop is PublicAirdrop {
    
    // Additional state for conditions
    mapping(address => bool) public whitelistedNFTs;
    mapping(address => uint256) public minimumTokenBalances;
    
    uint256 public minimumETHBalance = 0.001 ether;
    uint256 public minimumAccountAge = 30 days; // Account must be older than this
    bool public requireUniqueEOA = true; // Only Externally Owned Accounts
    
    // Track first transaction times (would need oracle or manual setting)
    mapping(address => uint256) public accountCreationTime;
    
    event ConditionUpdated(string conditionType, address indexed target, uint256 value);
    event AccountAgeSet(address indexed account, uint256 timestamp);

    constructor(address _token, address initialOwner) 
        PublicAirdrop(_token, initialOwner) {}

    // =============================================================================
    // CONDITION SETTERS
    // =============================================================================

    function setMinimumETHBalance(uint256 _minBalance) external onlyOwner {
        minimumETHBalance = _minBalance;
        emit ConditionUpdated("ETH_BALANCE", address(0), _minBalance);
    }

    function setMinimumAccountAge(uint256 _minAge) external onlyOwner {
        minimumAccountAge = _minAge;
        emit ConditionUpdated("ACCOUNT_AGE", address(0), _minAge);
    }

    function setRequireUniqueEOA(bool _require) external onlyOwner {
        requireUniqueEOA = _require;
        emit ConditionUpdated("REQUIRE_EOA", address(0), _require ? 1 : 0);
    }

    function addWhitelistedNFT(address nftContract) external onlyOwner {
        whitelistedNFTs[nftContract] = true;
        emit ConditionUpdated("NFT_WHITELIST", nftContract, 1);
    }

    function removeWhitelistedNFT(address nftContract) external onlyOwner {
        whitelistedNFTs[nftContract] = false;
        emit ConditionUpdated("NFT_WHITELIST", nftContract, 0);
    }

    function setMinimumTokenBalance(address tokenContract, uint256 minBalance) external onlyOwner {
        minimumTokenBalances[tokenContract] = minBalance;
        emit ConditionUpdated("TOKEN_BALANCE", tokenContract, minBalance);
    }

    // Manual setting of account ages (would typically come from oracle or indexer)
    function setAccountCreationTime(address account, uint256 timestamp) external onlyOwner {
        require(timestamp <= block.timestamp, "Cannot set future timestamp");
        accountCreationTime[account] = timestamp;
        emit AccountAgeSet(account, timestamp);
    }

    function batchSetAccountCreationTimes(
        address[] calldata accounts, 
        uint256[] calldata timestamps
    ) external onlyOwner {
        require(accounts.length == timestamps.length, "Array length mismatch");
        
        for (uint256 i = 0; i < accounts.length; i++) {
            require(timestamps[i] <= block.timestamp, "Cannot set future timestamp");
            accountCreationTime[accounts[i]] = timestamps[i];
            emit AccountAgeSet(accounts[i], timestamps[i]);
        }
    }

    // =============================================================================
    // ENHANCED CONDITION CHECKING
    // =============================================================================

    function meetsClaimConditions(address user) public view override returns (bool) {
        // 1. ETH Balance Check
        if (user.balance < minimumETHBalance) {
            return false;
        }
        
        // 2. EOA Check (no contract addresses)
        if (requireUniqueEOA && user.code.length > 0) {
            return false;
        }
        
        // 3. Account Age Check
        if (minimumAccountAge > 0) {
            uint256 creationTime = accountCreationTime[user];
            if (creationTime == 0 || (block.timestamp - creationTime) < minimumAccountAge) {
                return false;
            }
        }
        
        // 4. NFT Ownership Check (must own at least one whitelisted NFT)
        if (hasWhitelistedNFTRequirement() && !ownsWhitelistedNFT(user)) {
            return false;
        }
        
        // 5. Token Balance Checks
        if (!meetsTokenBalanceRequirements(user)) {
            return false;
        }
        
        return true;
    }

    function hasWhitelistedNFTRequirement() public view returns (bool) {
        // Check if any NFTs are whitelisted
        // Note: This is a simplified check. In practice, you'd track this more efficiently
        return false; // Would need to implement proper tracking
    }

    function ownsWhitelistedNFT(address user) public view returns (bool) {
        // This is a gas-intensive operation in practice
        // You'd typically track whitelisted NFTs in an array or use events
        
        // For demonstration, check if user owns any balance of commonly used NFTs
        // In practice, you'd iterate through your whitelisted NFT list
        
        return false; // Placeholder - implement based on your whitelist
    }

    function meetsTokenBalanceRequirements(address user) public view returns (bool) {
        // Check minimum balances for required tokens
        // This would be expensive to iterate in practice - consider using mappings efficiently
        
        // Example: Require minimum balance of the airdrop token itself
        if (minimumTokenBalances[address(token)] > 0) {
            if (token.balanceOf(user) < minimumTokenBalances[address(token)]) {
                return false;
            }
        }
        
        // Add other token checks as needed
        return true;
    }

    // =============================================================================
    // CONDITION CHECKING HELPERS
    // =============================================================================

    function checkAllConditions(address user) external view returns (
        bool meetsETHBalance,
        bool isEOA,
        bool meetsAccountAge,
        bool ownsRequiredNFT,
        bool meetsTokenBalances,
        bool overallResult,
        string memory failureReason
    ) {
        meetsETHBalance = user.balance >= minimumETHBalance;
        isEOA = !requireUniqueEOA || user.code.length == 0;
        
        uint256 creationTime = accountCreationTime[user];
        meetsAccountAge = minimumAccountAge == 0 || 
            (creationTime > 0 && (block.timestamp - creationTime) >= minimumAccountAge);
        
        ownsRequiredNFT = !hasWhitelistedNFTRequirement() || ownsWhitelistedNFT(user);
        meetsTokenBalances = meetsTokenBalanceRequirements(user);
        
        overallResult = meetsETHBalance && isEOA && meetsAccountAge && 
                       ownsRequiredNFT && meetsTokenBalances;
        
        // Determine failure reason
        if (!meetsETHBalance) {
            failureReason = "Insufficient ETH balance";
        } else if (!isEOA) {
            failureReason = "Contract addresses not allowed";
        } else if (!meetsAccountAge) {
            failureReason = "Account too new";
        } else if (!ownsRequiredNFT) {
            failureReason = "Does not own required NFT";
        } else if (!meetsTokenBalances) {
            failureReason = "Insufficient token balances";
        } else {
            failureReason = "All conditions met";
        }
    }

    // =============================================================================
    // SPECIALIZED CAMPAIGN TYPES
    // =============================================================================

    function createHolderOnlyAirdrop(
        string calldata name,
        uint256 claimAmount,
        uint256 totalBudget,
        uint256 duration,
        address requiredToken,
        uint256 minimumBalance
    ) external onlyOwner returns (uint256 campaignId) {
        // Set the token requirement
        minimumTokenBalances[requiredToken] = minimumBalance;
        
        // Create conditional campaign
        campaignId = this.createConditionalCampaign(name, claimAmount, totalBudget, duration);
        
        emit ConditionUpdated("HOLDER_REQUIREMENT", requiredToken, minimumBalance);
    }

    function createNFTHolderAirdrop(
        string calldata name,
        uint256 claimAmount,
        uint256 totalBudget,
        uint256 duration,
        address nftContract
    ) external onlyOwner returns (uint256 campaignId) {
        // Whitelist the NFT
        whitelistedNFTs[nftContract] = true;
        
        // Create conditional campaign
        campaignId = this.createConditionalCampaign(name, claimAmount, totalBudget, duration);
        
        emit ConditionUpdated("NFT_REQUIREMENT", nftContract, 1);
    }

    function createOldAccountsAirdrop(
        string calldata name,
        uint256 claimAmount,
        uint256 totalBudget,
        uint256 duration,
        uint256 minimumAge
    ) external onlyOwner returns (uint256 campaignId) {
        // Set age requirement
        minimumAccountAge = minimumAge;
        
        // Create conditional campaign
        campaignId = this.createConditionalCampaign(name, claimAmount, totalBudget, duration);
        
        emit ConditionUpdated("AGE_REQUIREMENT", address(0), minimumAge);
    }

    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================

    function getConditionSettings() external view returns (
        uint256 minETHBalance,
        uint256 minAccountAge,
        bool requiresEOA,
        uint256 whitelistedNFTCount,
        uint256 tokenRequirementCount
    ) {
        return (
            minimumETHBalance,
            minimumAccountAge, 
            requireUniqueEOA,
            0, // Would need to track this properly
            0  // Would need to track this properly
        );
    }

    function isNFTWhitelisted(address nftContract) external view returns (bool) {
        return whitelistedNFTs[nftContract];
    }

    function getTokenRequirement(address tokenContract) external view returns (uint256) {
        return minimumTokenBalances[tokenContract];
    }

    function getUserAccountAge(address user) external view returns (uint256 ageInSeconds) {
        uint256 creationTime = accountCreationTime[user];
        if (creationTime == 0) return 0;
        return block.timestamp - creationTime;
    }
}