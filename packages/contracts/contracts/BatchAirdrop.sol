// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MyToken.sol";

contract BatchAirdrop is Ownable, ReentrancyGuard {
    MyToken public immutable token;
    
    mapping(address => bool) public hasReceived;
    mapping(uint256 => bool) public campaignExecuted;
    
    uint256 public totalAirdropped;
    uint256 public campaignCounter;
    
    event AirdropExecuted(
        uint256 indexed campaignId,
        uint256 recipientCount,
        uint256 totalAmount
    );
    
    event SingleAirdrop(
        address indexed recipient,
        uint256 amount,
        uint256 indexed campaignId
    );

    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        require(_token != address(0), "Token address cannot be zero");
        token = MyToken(_token);
    }

    function batchAirdrop(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner nonReentrant {
        require(recipients.length == amounts.length, "Array lengths must match");
        require(recipients.length > 0, "No recipients provided");
        require(recipients.length <= 500, "Too many recipients, use multiple transactions");
        
        uint256 campaignId = ++campaignCounter;
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            uint256 amount = amounts[i];
            
            require(recipient != address(0), "Invalid recipient address");
            require(amount > 0, "Amount must be greater than zero");
            
            // Mint tokens directly to recipient
            token.mint(recipient, amount);
            totalAmount += amount;
            
            emit SingleAirdrop(recipient, amount, campaignId);
        }
        
        totalAirdropped += totalAmount;
        campaignExecuted[campaignId] = true;
        
        emit AirdropExecuted(campaignId, recipients.length, totalAmount);
    }

    function uniformAirdrop(
        address[] calldata recipients,
        uint256 amountPerRecipient
    ) external onlyOwner nonReentrant {
        require(recipients.length > 0, "No recipients provided");
        require(recipients.length <= 500, "Too many recipients");
        require(amountPerRecipient > 0, "Amount must be greater than zero");
        
        uint256 campaignId = ++campaignCounter;
        uint256 totalAmount = recipients.length * amountPerRecipient;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            require(recipient != address(0), "Invalid recipient address");
            
            token.mint(recipient, amountPerRecipient);
            emit SingleAirdrop(recipient, amountPerRecipient, campaignId);
        }
        
        totalAirdropped += totalAmount;
        campaignExecuted[campaignId] = true;
        
        emit AirdropExecuted(campaignId, recipients.length, totalAmount);
    }

    function emergencyWithdrawTokens(uint256 amount) external onlyOwner {
        require(token.balanceOf(address(this)) >= amount, "Insufficient balance");
        require(token.transfer(owner(), amount), "Transfer failed");
    }
    
    function getStats() external view returns (
        uint256 totalCampaigns,
        uint256 totalDistributed,
        uint256 contractBalance
    ) {
        return (
            campaignCounter,
            totalAirdropped,
            token.balanceOf(address(this))
        );
    }
}