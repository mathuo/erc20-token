// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./MyToken.sol";

contract MerkleAirdrop is Ownable, ReentrancyGuard {
    MyToken public immutable token;
    
    struct AirdropCampaign {
        bytes32 merkleRoot;
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 endTime;
        bool active;
        string name;
    }
    
    mapping(uint256 => AirdropCampaign) public campaigns;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    
    uint256 public campaignCounter;
    
    event CampaignCreated(
        uint256 indexed campaignId,
        string name,
        bytes32 merkleRoot,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime
    );
    
    event TokensClaimed(
        uint256 indexed campaignId,
        address indexed recipient,
        uint256 amount
    );
    
    event CampaignStatusChanged(
        uint256 indexed campaignId,
        bool active
    );

    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        require(_token != address(0), "Token address cannot be zero");
        token = MyToken(_token);
    }

    function createCampaign(
        string calldata name,
        bytes32 merkleRoot,
        uint256 totalAmount,
        uint256 duration
    ) external onlyOwner {
        require(merkleRoot != bytes32(0), "Invalid merkle root");
        require(totalAmount > 0, "Total amount must be greater than zero");
        require(duration > 0, "Duration must be greater than zero");
        
        uint256 campaignId = ++campaignCounter;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;
        
        campaigns[campaignId] = AirdropCampaign({
            merkleRoot: merkleRoot,
            totalAmount: totalAmount,
            claimedAmount: 0,
            startTime: startTime,
            endTime: endTime,
            active: true,
            name: name
        });
        
        emit CampaignCreated(
            campaignId,
            name,
            merkleRoot,
            totalAmount,
            startTime,
            endTime
        );
    }

    function claim(
        uint256 campaignId,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external nonReentrant {
        AirdropCampaign storage campaign = campaigns[campaignId];
        
        require(campaign.active, "Campaign is not active");
        require(block.timestamp >= campaign.startTime, "Campaign not started");
        require(block.timestamp <= campaign.endTime, "Campaign has ended");
        require(!hasClaimed[campaignId][msg.sender], "Already claimed");
        require(amount > 0, "Amount must be greater than zero");
        
        // Verify merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(
            MerkleProof.verify(merkleProof, campaign.merkleRoot, leaf),
            "Invalid merkle proof"
        );
        
        require(
            campaign.claimedAmount + amount <= campaign.totalAmount,
            "Insufficient campaign balance"
        );
        
        // Mark as claimed
        hasClaimed[campaignId][msg.sender] = true;
        campaign.claimedAmount += amount;
        
        // Mint tokens to claimant
        token.mint(msg.sender, amount);
        
        emit TokensClaimed(campaignId, msg.sender, amount);
    }

    function setCampaignStatus(uint256 campaignId, bool active) external onlyOwner {
        require(campaignId <= campaignCounter && campaignId > 0, "Invalid campaign ID");
        campaigns[campaignId].active = active;
        emit CampaignStatusChanged(campaignId, active);
    }

    function extendCampaign(uint256 campaignId, uint256 additionalTime) external onlyOwner {
        require(campaignId <= campaignCounter && campaignId > 0, "Invalid campaign ID");
        campaigns[campaignId].endTime += additionalTime;
    }

    function getCampaignInfo(uint256 campaignId) external view returns (
        string memory name,
        bytes32 merkleRoot,
        uint256 totalAmount,
        uint256 claimedAmount,
        uint256 remainingAmount,
        uint256 startTime,
        uint256 endTime,
        bool active,
        bool isActive
    ) {
        AirdropCampaign storage campaign = campaigns[campaignId];
        
        bool currentlyActive = campaign.active && 
            block.timestamp >= campaign.startTime && 
            block.timestamp <= campaign.endTime;
            
        return (
            campaign.name,
            campaign.merkleRoot,
            campaign.totalAmount,
            campaign.claimedAmount,
            campaign.totalAmount - campaign.claimedAmount,
            campaign.startTime,
            campaign.endTime,
            campaign.active,
            currentlyActive
        );
    }

    function checkClaimStatus(uint256 campaignId, address user) external view returns (bool) {
        return hasClaimed[campaignId][user];
    }

    function getActiveCampaigns() external view returns (uint256[] memory) {
        uint256[] memory activeCampaigns = new uint256[](campaignCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= campaignCounter; i++) {
            AirdropCampaign storage campaign = campaigns[i];
            if (campaign.active && 
                block.timestamp >= campaign.startTime && 
                block.timestamp <= campaign.endTime) {
                activeCampaigns[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeCampaigns[i];
        }
        
        return result;
    }
}