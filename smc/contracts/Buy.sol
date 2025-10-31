// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TokenBuy
 * @dev Contract for buying tokens with HBAR on Hedera Network
 */
contract TokenBuy is Ownable, ReentrancyGuard, Pausable {
    IERC20 public token;
    
    uint256 public tokenPrice; // Price in wei (tinybars on Hedera)
    uint256 public minPurchase;
    uint256 public maxPurchase;
    
    uint256 public totalSold;
    
    mapping(address => uint256) public purchasedAmount;
    
    event TokensPurchased(
        address indexed buyer,
        uint256 hbarAmount,
        uint256 tokenAmount
    );
    event PriceUpdated(uint256 newPrice);
    event LimitsUpdated(uint256 minPurchase, uint256 maxPurchase);
    event TokensWithdrawn(address indexed owner, uint256 amount);
    event HBARWithdrawn(address indexed owner, uint256 amount);
    
    constructor(
        address tokenAddress,
        uint256 _tokenPrice,
        uint256 _minPurchase,
        uint256 _maxPurchase
    ) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Invalid token address");
        require(_tokenPrice > 0, "Price must be greater than 0");
        require(_maxPurchase >= _minPurchase, "Max must be >= min");
        
        token = IERC20(tokenAddress);
        tokenPrice = _tokenPrice;
        minPurchase = _minPurchase;
        maxPurchase = _maxPurchase;
    }
    
    /**
     * @dev Buy tokens with HBAR
     */
    function buyTokens() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Must send HBAR to buy tokens");
        
        uint256 tokenAmount = calculateTokenAmount(msg.value);
        
        require(tokenAmount >= minPurchase, "Below minimum purchase amount");
        require(tokenAmount <= maxPurchase, "Exceeds maximum purchase amount");
        
        uint256 contractBalance = token.balanceOf(address(this));
        require(contractBalance >= tokenAmount, "Insufficient tokens in contract");
        
        purchasedAmount[msg.sender] += tokenAmount;
        totalSold += tokenAmount;
        
        require(token.transfer(msg.sender, tokenAmount), "Token transfer failed");
        
        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }
    
    /**
     * @dev Calculate token amount for given HBAR amount
     */
    function calculateTokenAmount(uint256 hbarAmount) public view returns (uint256) {
        return (hbarAmount * 10**18) / tokenPrice;
    }
    
    /**
     * @dev Calculate HBAR cost for given token amount
     */
    function calculateHBARCost(uint256 tokenAmount) public view returns (uint256) {
        return (tokenAmount * tokenPrice) / 10**18;
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
     * @dev Update purchase limits (only owner)
     */
    function setPurchaseLimits(
        uint256 _minPurchase,
        uint256 _maxPurchase
    ) external onlyOwner {
        require(_maxPurchase >= _minPurchase, "Max must be >= min");
        minPurchase = _minPurchase;
        maxPurchase = _maxPurchase;
        emit LimitsUpdated(_minPurchase, _maxPurchase);
    }
    
    /**
     * @dev Fund the contract with tokens (for sales)
     */
    function fundContract(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
    }
    
    /**
     * @dev Withdraw tokens from contract (only owner)
     */
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        uint256 balance = token.balanceOf(address(this));
        require(balance >= amount, "Insufficient token balance");
        
        require(token.transfer(msg.sender, amount), "Token transfer failed");
        emit TokensWithdrawn(msg.sender, amount);
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
     * @dev Get contract token balance
     */
    function getTokenBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
    
    /**
     * @dev Get contract HBAR balance
     */
    function getHBARBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Pause buy operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause buy operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Receive function to accept HBAR
     */
    receive() external payable {}
}
