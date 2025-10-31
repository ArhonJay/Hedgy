// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TokenFaucet
 * @dev Faucet contract for distributing test tokens on Hedera testnet
 */
contract TokenFaucet is Ownable, ReentrancyGuard, Pausable {
    IERC20 public token;
    
    uint256 public dripAmount;
    uint256 public cooldownTime;
    
    mapping(address => uint256) public lastDripTime;
    mapping(address => uint256) public totalClaimed;
    
    event TokensDripped(address indexed recipient, uint256 amount);
    event DripAmountUpdated(uint256 newAmount);
    event CooldownTimeUpdated(uint256 newCooldown);
    event FaucetFunded(address indexed funder, uint256 amount);
    event FaucetWithdrawn(address indexed owner, uint256 amount);
    
    constructor(
        address tokenAddress,
        uint256 _dripAmount,
        uint256 _cooldownTime
    ) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Invalid token address");
        require(_dripAmount > 0, "Drip amount must be greater than 0");
        
        token = IERC20(tokenAddress);
        dripAmount = _dripAmount;
        cooldownTime = _cooldownTime;
    }
    
    /**
     * @dev Request tokens from faucet
     */
    function requestTokens() external nonReentrant whenNotPaused {
        require(
            block.timestamp >= lastDripTime[msg.sender] + cooldownTime,
            "Cooldown period not elapsed"
        );
        
        uint256 faucetBalance = token.balanceOf(address(this));
        require(faucetBalance >= dripAmount, "Faucet is empty");
        
        lastDripTime[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += dripAmount;
        
        require(token.transfer(msg.sender, dripAmount), "Token transfer failed");
        
        emit TokensDripped(msg.sender, dripAmount);
    }
    
    /**
     * @dev Check if address can request tokens
     */
    function canRequestTokens(address account) external view returns (bool) {
        return block.timestamp >= lastDripTime[account] + cooldownTime;
    }
    
    /**
     * @dev Get time remaining until next drip
     */
    function timeUntilNextDrip(address account) external view returns (uint256) {
        uint256 nextDripTime = lastDripTime[account] + cooldownTime;
        if (block.timestamp >= nextDripTime) {
            return 0;
        }
        return nextDripTime - block.timestamp;
    }
    
    /**
     * @dev Update drip amount (only owner)
     */
    function setDripAmount(uint256 newAmount) external onlyOwner {
        require(newAmount > 0, "Drip amount must be greater than 0");
        dripAmount = newAmount;
        emit DripAmountUpdated(newAmount);
    }
    
    /**
     * @dev Update cooldown time (only owner)
     */
    function setCooldownTime(uint256 newCooldown) external onlyOwner {
        cooldownTime = newCooldown;
        emit CooldownTimeUpdated(newCooldown);
    }
    
    /**
     * @dev Fund the faucet with tokens
     */
    function fundFaucet(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        emit FaucetFunded(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw tokens from faucet (only owner)
     */
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        uint256 balance = token.balanceOf(address(this));
        require(balance >= amount, "Insufficient balance");
        
        require(token.transfer(msg.sender, amount), "Token transfer failed");
        emit FaucetWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Get faucet balance
     */
    function getFaucetBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
    
    /**
     * @dev Pause faucet operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause faucet operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
