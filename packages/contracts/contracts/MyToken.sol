// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, ERC20Permit, Ownable {
    
    address public treasury;
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    
    
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialOwner,
        address _treasury
    ) ERC20(name, symbol) ERC20Permit(name) Ownable(initialOwner) {
        require(_treasury != address(0), "Treasury cannot be zero address");
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds maximum");
        
        treasury = _treasury;
        
        // Mint initial supply to treasury (not scaled by decimals since initialSupply is already in wei)
        if (initialSupply > 0) {
            _mint(_treasury, initialSupply);
        }
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        _mint(to, amount);
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Treasury cannot be zero address");
        address oldTreasury = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(oldTreasury, _treasury);
    }
    
    
    
    
    
    
    
    
    
    

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) public {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}