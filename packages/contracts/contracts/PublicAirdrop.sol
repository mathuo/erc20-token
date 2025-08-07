// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MyToken.sol";

contract PublicAirdrop is Ownable, ReentrancyGuard {
    MyToken public immutable token;
    
    struct Campaign {
        uint256 claimAmount;        // Amount each user can claim
        uint256 totalBudget;        // Total tokens allocated to campaign
        uint256 claimedAmount;      // Total tokens claimed so far
        uint256 startTime;          // When claims start
        uint256 endTime;            // When claims end
        uint256 cooldownPeriod;     // Time between claims (0 = one-time only)
        uint256 maxClaimsPerUser;   // Max claims per user (0 = unlimited with cooldown)
        bool active;                // Can be paused
        bool requiresConditions;    // Whether to check claim conditions
        string name;                // Campaign name
    }
    
    struct UserClaim {
        uint256 claimCount;         // Number of times user has claimed
        uint256 lastClaimTime;      // When user last claimed
        uint256 totalClaimed;       // Total amount user has claimed
    }
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => UserClaim)) public userClaims;
    
    uint256 public campaignCounter;
    
    event CampaignCreated(
        uint256 indexed campaignId,
        string name,
        uint256 claimAmount,
        uint256 totalBudget,
        uint256 startTime,
        uint256 endTime
    );
    
    event TokensClaimed(
        uint256 indexed campaignId,
        address indexed user,
        uint256 amount,
        uint256 claimNumber
    );
    
    event CampaignUpdated(uint256 indexed campaignId, string field);

    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        require(_token != address(0), "Token address cannot be zero");
        token = MyToken(_token);
    }

    // =============================================================================
    // CAMPAIGN MANAGEMENT
    // =============================================================================

    function createSimpleCampaign(
        string calldata name,
        uint256 claimAmount,        // e.g., 100 tokens per claim
        uint256 totalBudget,        // e.g., 10,000 tokens total
        uint256 duration            // Campaign length in seconds
    ) external onlyOwner returns (uint256 campaignId) {
        campaignId = ++campaignCounter;
        
        campaigns[campaignId] = Campaign({
            claimAmount: claimAmount,
            totalBudget: totalBudget,
            claimedAmount: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            cooldownPeriod: 0,              // One-time claim only
            maxClaimsPerUser: 1,            // Each user can claim once
            active: true,
            requiresConditions: false,
            name: name
        });
        
        emit CampaignCreated(campaignId, name, claimAmount, totalBudget, block.timestamp, block.timestamp + duration);
    }

    function createFaucetCampaign(
        string calldata name,
        uint256 claimAmount,        // e.g., 10 tokens per claim
        uint256 totalBudget,        // e.g., 100,000 tokens total
        uint256 duration,           // Campaign length
        uint256 cooldownHours,      // Hours between claims (e.g., 24)
        uint256 maxClaimsPerUser    // Max lifetime claims per user (0 = unlimited)
    ) external onlyOwner returns (uint256 campaignId) {
        campaignId = ++campaignCounter;
        
        campaigns[campaignId] = Campaign({
            claimAmount: claimAmount,
            totalBudget: totalBudget,
            claimedAmount: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            cooldownPeriod: cooldownHours * 1 hours,
            maxClaimsPerUser: maxClaimsPerUser,
            active: true,
            requiresConditions: false,
            name: name
        });
        
        emit CampaignCreated(campaignId, name, claimAmount, totalBudget, block.timestamp, block.timestamp + duration);
    }

    function createConditionalCampaign(
        string calldata name,
        uint256 claimAmount,
        uint256 totalBudget,
        uint256 duration
    ) external onlyOwner returns (uint256 campaignId) {
        campaignId = ++campaignCounter;
        
        campaigns[campaignId] = Campaign({
            claimAmount: claimAmount,
            totalBudget: totalBudget,
            claimedAmount: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            cooldownPeriod: 0,
            maxClaimsPerUser: 1,
            active: true,
            requiresConditions: true,           // Will check conditions
            name: name
        });
        
        emit CampaignCreated(campaignId, name, claimAmount, totalBudget, block.timestamp, block.timestamp + duration);
    }

    // =============================================================================
    // CLAIMING FUNCTIONS
    // =============================================================================

    function claim(uint256 campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        UserClaim storage userClaim = userClaims[campaignId][msg.sender];
        
        // Basic validations
        require(campaign.active, "Campaign is not active");
        require(block.timestamp >= campaign.startTime, "Campaign not started");
        require(block.timestamp <= campaign.endTime, "Campaign has ended");
        require(campaign.claimedAmount + campaign.claimAmount <= campaign.totalBudget, "Campaign budget exhausted");
        
        // User-specific validations
        if (campaign.maxClaimsPerUser > 0) {
            require(userClaim.claimCount < campaign.maxClaimsPerUser, "Max claims per user reached");
        }
        
        if (campaign.cooldownPeriod > 0 && userClaim.lastClaimTime > 0) {
            require(
                block.timestamp >= userClaim.lastClaimTime + campaign.cooldownPeriod,
                "Cooldown period not elapsed"
            );
        }
        
        // Conditional checks
        if (campaign.requiresConditions) {
            require(meetsClaimConditions(msg.sender), "Does not meet claim conditions");
        }
        
        // Update state
        userClaim.claimCount++;
        userClaim.lastClaimTime = block.timestamp;
        userClaim.totalClaimed += campaign.claimAmount;
        campaign.claimedAmount += campaign.claimAmount;
        
        // Mint tokens
        token.mint(msg.sender, campaign.claimAmount);
        
        emit TokensClaimed(campaignId, msg.sender, campaign.claimAmount, userClaim.claimCount);
    }

    // =============================================================================
    // CLAIM CONDITIONS (Override for custom logic)
    // =============================================================================

    function meetsClaimConditions(address user) public view virtual returns (bool) {
        // Default conditions - can be overridden in derived contracts
        
        // Example 1: Must hold minimum ETH
        if (user.balance < 0.001 ether) return false;
        
        // Example 2: Must not be a contract (EOA only)
        if (user.code.length > 0) return false;
        
        // Example 3: Must hold some of this token already (loyalty check)
        if (token.balanceOf(user) < 1 ether) return false;
        
        return true;
    }

    // Alternative: Check if user holds specific NFT
    function meetsNFTCondition(address user, address nftContract) public view returns (bool) {
        try IERC721(nftContract).balanceOf(user) returns (uint256 balance) {
            return balance > 0;
        } catch {
            return false;
        }
    }

    // Alternative: Check if user has made transactions recently
    function meetsActivityCondition(address user) public view returns (bool) {
        // This is a simplified check - in practice you'd track this differently
        return user.balance > 0; // Has some ETH (proxy for activity)
    }

    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================

    function getCampaignInfo(uint256 campaignId) external view returns (
        string memory name,
        uint256 claimAmount,
        uint256 totalBudget,
        uint256 claimedAmount,
        uint256 remainingBudget,
        uint256 startTime,
        uint256 endTime,
        uint256 cooldownPeriod,
        uint256 maxClaimsPerUser,
        bool active,
        bool isCurrentlyActive
    ) {
        Campaign storage campaign = campaigns[campaignId];
        
        bool currentlyActive = campaign.active && 
            block.timestamp >= campaign.startTime && 
            block.timestamp <= campaign.endTime &&
            campaign.claimedAmount < campaign.totalBudget;
            
        return (
            campaign.name,
            campaign.claimAmount,
            campaign.totalBudget,
            campaign.claimedAmount,
            campaign.totalBudget - campaign.claimedAmount,
            campaign.startTime,
            campaign.endTime,
            campaign.cooldownPeriod,
            campaign.maxClaimsPerUser,
            campaign.active,
            currentlyActive
        );
    }

    function getUserClaimInfo(uint256 campaignId, address user) external view returns (
        uint256 claimCount,
        uint256 lastClaimTime,
        uint256 totalClaimed,
        bool canClaimNow,
        uint256 nextClaimTime,
        string memory status
    ) {
        Campaign storage campaign = campaigns[campaignId];
        UserClaim storage userClaim = userClaims[campaignId][user];
        
        bool canClaim = true;
        string memory statusMsg = "Ready to claim";
        uint256 nextClaim = 0;
        
        if (!campaign.active) {
            canClaim = false;
            statusMsg = "Campaign inactive";
        } else if (block.timestamp < campaign.startTime) {
            canClaim = false;
            statusMsg = "Campaign not started";
        } else if (block.timestamp > campaign.endTime) {
            canClaim = false;
            statusMsg = "Campaign ended";
        } else if (campaign.claimedAmount >= campaign.totalBudget) {
            canClaim = false;
            statusMsg = "Campaign budget exhausted";
        } else if (campaign.maxClaimsPerUser > 0 && userClaim.claimCount >= campaign.maxClaimsPerUser) {
            canClaim = false;
            statusMsg = "Max claims reached";
        } else if (campaign.cooldownPeriod > 0 && userClaim.lastClaimTime > 0) {
            nextClaim = userClaim.lastClaimTime + campaign.cooldownPeriod;
            if (block.timestamp < nextClaim) {
                canClaim = false;
                statusMsg = "In cooldown period";
            }
        }
        
        if (canClaim && campaign.requiresConditions && !meetsClaimConditions(user)) {
            canClaim = false;
            statusMsg = "Does not meet conditions";
        }
        
        return (
            userClaim.claimCount,
            userClaim.lastClaimTime,
            userClaim.totalClaimed,
            canClaim,
            nextClaim,
            statusMsg
        );
    }

    function getActiveCampaigns() external view returns (uint256[] memory) {
        uint256[] memory activeCampaigns = new uint256[](campaignCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= campaignCounter; i++) {
            Campaign storage campaign = campaigns[i];
            if (campaign.active && 
                block.timestamp >= campaign.startTime && 
                block.timestamp <= campaign.endTime &&
                campaign.claimedAmount < campaign.totalBudget) {
                activeCampaigns[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeCampaigns[i];
        }
        
        return result;
    }

    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================

    function setCampaignStatus(uint256 campaignId, bool active) external onlyOwner {
        campaigns[campaignId].active = active;
        emit CampaignUpdated(campaignId, "status");
    }

    function extendCampaign(uint256 campaignId, uint256 additionalTime) external onlyOwner {
        campaigns[campaignId].endTime += additionalTime;
        emit CampaignUpdated(campaignId, "endTime");
    }

    function increaseBudget(uint256 campaignId, uint256 additionalBudget) external onlyOwner {
        campaigns[campaignId].totalBudget += additionalBudget;
        emit CampaignUpdated(campaignId, "budget");
    }

    function updateClaimAmount(uint256 campaignId, uint256 newClaimAmount) external onlyOwner {
        campaigns[campaignId].claimAmount = newClaimAmount;
        emit CampaignUpdated(campaignId, "claimAmount");
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        if (balance > 0) {
            require(token.transfer(owner(), balance), "Transfer failed");
        }
    }
}

// Interface for NFT checks
interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
}