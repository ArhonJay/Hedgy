// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TokenSell
 * @dev Contract for selling tokens back for HBAR on Hedera Network
 */
contract TokenSell is Ownable, ReentrancyGuard, Pausable {
    IERC20 public token;
    
    uint256 public tokenPrice; // Price in wei (tinybars on Hedera)
    uint256 public minSell;
    uint256 public maxSell;
    
    uint256 public totalBought;
    
    mapping(address => uint256) public soldAmount;
    
    event TokensSold(
        address indexed seller,
        uint256 tokenAmount,
        uint256 hbarAmount
    );
    event PriceUpdated(uint256 newPrice);
    event LimitsUpdated(uint256 minSell, uint256 maxSell);
    event HBARDeposited(address indexed depositor, uint256 amount);
    event HBARWithdrawn(address indexed owner, uint256 amount);
    
    constructor(
        address tokenAddress,
        uint256 _tokenPrice,
        uint256 _minSell,
        uint256 _maxSell
    ) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Invalid token address");
        require(_tokenPrice > 0, "Price must be greater than 0");
        require(_maxSell >= _minSell, "Max must be >= min");
        
        token = IERC20(tokenAddress);
        tokenPrice = _tokenPrice;
        minSell = _minSell;
        maxSell = _maxSell;
    }
    
    /**
     * @dev Sell tokens for HBAR
     */
    function sellTokens(uint256 tokenAmount) external nonReentrant whenNotPaused {
        require(tokenAmount > 0, "Amount must be greater than 0");
        require(tokenAmount >= minSell, "Below minimum sell amount");
        require(tokenAmount <= maxSell, "Exceeds maximum sell amount");
        
        // Calculate HBAR amount in wei
        uint256 hbarAmountWei = calculateHBARAmount(tokenAmount);
        
        // Convert wei to tinybar for Hedera compatibility
        // On Hedera: 1 HBAR = 100,000,000 tinybar = 10^18 wei
        // Therefore: tinybar = wei / 10^10
        uint256 hbarAmountTinybar = hbarAmountWei / 10**10;
        
        // address(this).balance returns tinybar on Hedera
        require(address(this).balance >= hbarAmountTinybar, "Insufficient HBAR in contract");
        
        // Check user has enough tokens
        require(
            token.balanceOf(msg.sender) >= tokenAmount,
            "Insufficient token balance"
        );
        
        // Transfer tokens from user to contract
        require(
            token.transferFrom(msg.sender, address(this), tokenAmount),
            "Token transfer failed"
        );
        
        soldAmount[msg.sender] += tokenAmount;
        totalBought += tokenAmount;
        
        // Transfer HBAR to user (in tinybar)
        (bool success, ) = msg.sender.call{value: hbarAmountTinybar}("");
        require(success, "HBAR transfer failed");
        
        emit TokensSold(msg.sender, tokenAmount, hbarAmountTinybar);
    }
    
    /**
     * @dev Calculate HBAR amount for given token amount (returns wei for consistency)
     */
    function calculateHBARAmount(uint256 tokenAmount) public view returns (uint256) {
        return (tokenAmount * tokenPrice) / 10**18;
    }
    
    /**
     * @dev Calculate token amount for given HBAR amount
     */
    function calculateTokenAmount(uint256 hbarAmount) public view returns (uint256) {
        return (hbarAmount * 10**18) / tokenPrice;
    }
    
    /**
     * @dev Update token price (only owner)
     */
    function setTokenPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be greater than 0");
        tokenPrice = newPrice;
        emit PriceUpdated(newPrice);
    }
    
    /**
     * @dev Update sell limits (only owner)
     */
    function setSellLimits(
        uint256 _minSell,
        uint256 _maxSell
    ) external onlyOwner {
        require(_maxSell >= _minSell, "Max must be >= min");
        minSell = _minSell;
        maxSell = _maxSell;
        emit LimitsUpdated(_minSell, _maxSell);
    }
    
    /**
     * @dev Deposit HBAR to the contract for buyback
     */
    function depositHBAR() external payable onlyOwner {
        require(msg.value > 0, "Must send HBAR");
        emit HBARDeposited(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw HBAR from contract (only owner)
     */
    function withdrawHBAR(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient HBAR balance");
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "HBAR transfer failed");
        
        emit HBARWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw tokens from contract (only owner)
     */
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        uint256 balance = token.balanceOf(address(this));
        require(balance >= amount, "Insufficient token balance");
        
        require(token.transfer(msg.sender, amount), "Token transfer failed");
    }
    
    /**
     * @dev Get contract HBAR balance (returns tinybar on Hedera)
     */
    function getHBARBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get contract token balance
     */
    function getTokenBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
    
    /**
     * @dev Pause sell operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause sell operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Receive function to accept HBAR
     */
    receive() external payable {
        emit HBARDeposited(msg.sender, msg.value);
    }
}