const { ethers } = require('ethers');
const { config, abis } = require('../config/contracts');

class ContractService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.contracts = {};
  }

  /**
   * Get a contract instance
   */
  getContract(contractName, signerOrProvider = null) {
    const address = config.contracts[contractName];
    const abi = abis[contractName];
    
    if (!address || !abi) {
      throw new Error(`Contract ${contractName} not found`);
    }

    return new ethers.Contract(
      address,
      abi,
      signerOrProvider || this.provider
    );
  }

  /**
   * Get wallet signer
   */
  getSigner(privateKey) {
    return new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Get HEDGY token balance
   */
  async getTokenBalance(address) {
    try {
      const tokenContract = this.getContract('token');
      const balance = await tokenContract.balanceOf(address);
      return ethers.formatUnits(balance, config.token.decimals);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }

  /**
   * Get HBAR balance
   */
  async getHbarBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting HBAR balance:', error);
      return '0';
    }
  }

  /**
   * Claim tokens from faucet
   */
  async claimFaucet(privateKey) {
    try {
      const signer = this.getSigner(privateKey);
      const faucetContract = this.getContract('faucet', signer);
      
      // Check HBAR balance first
      const hbarBalance = await this.provider.getBalance(signer.address);
      if (hbarBalance === 0n) {
        return {
          success: false,
          error: '⚠️ You need HBAR for gas fees!\n\nUse /hbarfaucet to get test HBAR first.',
          needsHbar: true
        };
      }

      // Check if user can request tokens
      try {
        const canRequest = await faucetContract.canRequestTokens(signer.address);
        console.log(`Can request tokens: ${canRequest}`);
        
        if (!canRequest) {
          // Get time until next drip
          const timeRemaining = await faucetContract.timeUntilNextDrip(signer.address);
          const hours = Math.floor(Number(timeRemaining) / 3600);
          const minutes = Math.floor((Number(timeRemaining) % 3600) / 60);
          
          return {
            success: false,
            error: `⏰ Faucet cooldown active!\n\nYou can claim again in ${hours}h ${minutes}m`
          };
        }
      } catch (checkError) {
        console.log('Cannot check request eligibility:', checkError.message);
      }

      // Check faucet balance
      try {
        const faucetBalance = await faucetContract.getFaucetBalance();
        const dripAmount = await faucetContract.dripAmount();
        
        console.log(`Faucet balance: ${ethers.formatEther(faucetBalance)}`);
        console.log(`Drip amount: ${ethers.formatEther(dripAmount)}`);
        
        if (faucetBalance < dripAmount) {
          return {
            success: false,
            error: '❌ Faucet is empty!\n\nPlease contact the admin to refill the faucet.'
          };
        }
      } catch (e) {
        console.log('Could not check faucet balance:', e.message);
      }

      console.log('Calling requestTokens() for address:', signer.address);
      
      const tx = await faucetContract.requestTokens({
        gasLimit: 300000
      });
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction status:', receipt.status);

      if (receipt.status === 0) {
        return {
          success: false,
          error: '❌ Transaction reverted!\n\nPossible reasons:\n• Cooldown period not expired (24h)\n• Faucet is empty\n• Contract is paused\n\nPlease try again later.'
        };
      }

      return {
        success: true,
        txHash: receipt.hash,
        amount: ethers.formatUnits(config.faucet.dripAmount, config.token.decimals)
      };
    } catch (error) {
      console.error('Faucet claim error:', error);
      
      // Parse specific error messages
      let errorMessage = 'Transaction failed';
      
      if (error.message && error.message.includes('Cooldown period not elapsed')) {
        errorMessage = '⏰ Cooldown period not elapsed!\n\nYou must wait 24 hours between claims.';
      } else if (error.message && error.message.includes('Faucet is empty')) {
        errorMessage = '❌ Faucet is empty!\n\nPlease contact the admin to refill the faucet.';
      } else if (error.code === 'CALL_EXCEPTION' && error.receipt?.status === 0) {
        errorMessage = '❌ Faucet transaction reverted!\n\n' +
                      'Possible reasons:\n' +
                      '• 24-hour cooldown not expired\n' +
                      '• Faucet contract is out of tokens\n' +
                      '• Contract is paused\n\n' +
                      'Please wait and try again later.';
      } else if (error.code === 'CALL_EXCEPTION') {
        errorMessage = '⚠️ Smart contract error!\n\n' +
                      'The faucet contract rejected your request.\n' +
                      'Please make sure you have HBAR for gas and try again.';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = '⚠️ Insufficient HBAR for gas fees.\n\nUse /hbarfaucet to get test HBAR!';
      } else if (error.message && error.message.includes('cannot estimate gas')) {
        errorMessage = '⚠️ Transaction will likely fail!\n\n' +
                      'Possible reasons:\n' +
                      '• 24-hour cooldown period not expired\n' +
                      '• Faucet is empty or paused\n\n' +
                      'Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Buy tokens with HBAR
   */
  async buyTokens(privateKey, hbarAmount) {
    try {
      const signer = this.getSigner(privateKey);
      const buyContract = this.getContract('buy', signer);
      
      // Check HBAR balance
      const balance = await this.provider.getBalance(signer.address);
      const value = ethers.parseEther(hbarAmount.toString());
      
      console.log(`Attempting to buy with ${hbarAmount} HBAR`);
      console.log(`Wallet balance: ${ethers.formatEther(balance)} HBAR`);
      
      if (balance < value) {
        return {
          success: false,
          error: `⚠️ Insufficient HBAR!\n\nYou need ${hbarAmount} HBAR but only have ${ethers.formatEther(balance)} HBAR.\n\nUse /hbarfaucet to get more!`
        };
      }

      // Get token amount using contract's calculation
      const tokensToReceive = await buyContract.calculateTokenAmount(value);
      
      // Check min/max purchase limits
      const minPurchase = await buyContract.minPurchase();
      const maxPurchase = await buyContract.maxPurchase();
      
      // Check contract has enough tokens
      const contractBalance = await buyContract.getTokenBalance();
      
      console.log(`Tokens to receive: ${ethers.formatEther(tokensToReceive)}`);
      console.log(`Min purchase: ${ethers.formatEther(minPurchase)}, Max: ${ethers.formatEther(maxPurchase)}`);
      console.log(`Contract token balance: ${ethers.formatEther(contractBalance)}`);
      
      if (contractBalance < tokensToReceive) {
        return {
          success: false,
          error: `❌ Contract doesn't have enough tokens!\n\n` +
                 `Contract has: ${ethers.formatUnits(contractBalance, config.token.decimals)} ${config.token.symbol}\n` +
                 `Needed: ${ethers.formatUnits(tokensToReceive, config.token.decimals)} ${config.token.symbol}\n\n` +
                 `Please contact the admin to refill the buy contract.`
        };
      }
      
      if (tokensToReceive < minPurchase) {
        const minHbar = await buyContract.calculateHBARCost(minPurchase);
        return {
          success: false,
          error: `⚠️ Purchase amount too small!\n\n` +
                 `Minimum purchase: ${ethers.formatUnits(minPurchase, config.token.decimals)} ${config.token.symbol}\n` +
                 `You would receive: ${ethers.formatUnits(tokensToReceive, config.token.decimals)} ${config.token.symbol}\n\n` +
                 `Try buying with at least ${ethers.formatEther(minHbar)} HBAR.`
        };
      }
      
      if (tokensToReceive > maxPurchase) {
        const maxHbar = await buyContract.calculateHBARCost(maxPurchase);
        return {
          success: false,
          error: `⚠️ Purchase amount too large!\n\n` +
                 `Maximum purchase: ${ethers.formatUnits(maxPurchase, config.token.decimals)} ${config.token.symbol}\n` +
                 `You would receive: ${ethers.formatUnits(tokensToReceive, config.token.decimals)} ${config.token.symbol}\n\n` +
                 `Try buying with at most ${ethers.formatEther(maxHbar)} HBAR.`
        };
      }
      
      // Call buyTokens() function
      console.log('Calling buyTokens() on contract:', config.contracts.buy);
      
      const tx = await buyContract.buyTokens({ 
        value,
        gasLimit: 500000
      });
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      if (receipt.status === 0) {
        return {
          success: false,
          error: '❌ Transaction reverted!\n\nPossible reasons:\n• Buy contract may not have enough tokens\n• Contract may be paused\n\nPlease contact the admin.'
        };
      }

      return {
        success: true,
        txHash: receipt.hash,
        tokensReceived: ethers.formatUnits(tokensToReceive, config.token.decimals)
      };
    } catch (error) {
      console.error('Buy tokens error:', error);
      
      let errorMessage = 'Transaction failed';
      
      if (error.message && error.message.includes('Insufficient tokens in contract')) {
        errorMessage = '❌ Buy contract is out of tokens!\n\nPlease contact the admin to refill.';
      } else if (error.message && error.message.includes('Below minimum purchase amount')) {
        errorMessage = '⚠️ Purchase amount is below minimum!\n\nTry buying with more HBAR.';
      } else if (error.message && error.message.includes('Exceeds maximum purchase amount')) {
        errorMessage = '⚠️ Purchase amount exceeds maximum!\n\nTry buying with less HBAR.';
      } else if (error.code === 'CALL_EXCEPTION' && error.receipt?.status === 0) {
        errorMessage = '❌ Smart contract rejected the transaction!\n\n' +
                      'Possible reasons:\n' +
                      '• Buy contract is out of tokens\n' +
                      '• Amount is outside min/max limits\n' +
                      '• Contract is paused\n\n' +
                      'Please contact the contract owner/admin.';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = '⚠️ Insufficient HBAR for this purchase + gas fees.\n\nUse /hbarfaucet to get more!';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Sell tokens for HBAR
   */
  async sellTokens(privateKey, tokenAmount) {
    try {
      const signer = this.getSigner(privateKey);
      const sellContract = this.getContract('sell', signer);
      const tokenContract = this.getContract('token', signer);
      
      const amount = ethers.parseUnits(tokenAmount.toString(), config.token.decimals);
      
      // Check token balance
      const balance = await tokenContract.balanceOf(signer.address);
      
      if (balance < amount) {
        const userBalance = ethers.formatUnits(balance, config.token.decimals);
        return {
          success: false,
          error: `⚠️ Insufficient ${config.token.symbol}!\n\nYou need ${tokenAmount} ${config.token.symbol} but only have ${parseFloat(userBalance).toFixed(2)} ${config.token.symbol}.\n\nUse /faucet or /buy to get more!`
        };
      }
      
      // Check min/max sell limits
      const minSell = await sellContract.minSell();
      const maxSell = await sellContract.maxSell();
      
      console.log(`Attempting to sell ${tokenAmount} ${config.token.symbol}`);
      console.log(`Min sell: ${ethers.formatEther(minSell)}, Max: ${ethers.formatEther(maxSell)}`);
      
      if (amount < minSell) {
        return {
          success: false,
          error: `⚠️ Sell amount too small!\n\n` +
                 `Minimum sell: ${ethers.formatUnits(minSell, config.token.decimals)} ${config.token.symbol}\n` +
                 `You're trying to sell: ${tokenAmount} ${config.token.symbol}\n\n` +
                 `Try selling more tokens.`
        };
      }
      
      if (amount > maxSell) {
        return {
          success: false,
          error: `⚠️ Sell amount too large!\n\n` +
                 `Maximum sell: ${ethers.formatUnits(maxSell, config.token.decimals)} ${config.token.symbol}\n` +
                 `You're trying to sell: ${tokenAmount} ${config.token.symbol}\n\n` +
                 `Try selling fewer tokens.`
        };
      }
      
      // Check HBAR for gas
      const hbarBalance = await this.provider.getBalance(signer.address);
      if (hbarBalance === 0n) {
        return {
          success: false,
          error: '⚠️ You need HBAR for gas fees!\n\nUse /hbarfaucet to get test HBAR first.'
        };
      }
      
      // Calculate HBAR to receive and check contract balance
      const hbarToReceive = await sellContract.calculateHBARAmount(amount);
      const contractHbarBalanceRaw = await sellContract.getHBARBalance();
      
      // Hedera returns balance in tinybar (1 HBAR = 100,000,000 tinybar)
      // Convert to wei for comparison (1 HBAR = 10^18 wei)
      // Multiply by 10^10 to convert tinybar to wei
      const contractHbarBalance = contractHbarBalanceRaw * 10000000000n;
      
      console.log(`HBAR to receive (wei): ${hbarToReceive}`);
      console.log(`HBAR to receive: ${ethers.formatEther(hbarToReceive)} HBAR`);
      console.log(`Contract HBAR balance (raw/tinybar): ${contractHbarBalanceRaw}`);
      console.log(`Contract HBAR balance (wei): ${contractHbarBalance}`);
      console.log(`Contract HBAR balance: ${ethers.formatEther(contractHbarBalance)} HBAR`);
      console.log(`User token amount to sell: ${ethers.formatUnits(amount, config.token.decimals)}`);
      
      if (contractHbarBalance < hbarToReceive) {
        return {
          success: false,
          error: `❌ Contract doesn't have enough HBAR!\n\n` +
                 `Contract has: ${ethers.formatEther(contractHbarBalance)} HBAR\n` +
                 `Needed: ${ethers.formatEther(hbarToReceive)} HBAR\n\n` +
                 `Please contact the admin to refill the sell contract at:\n${config.contracts.sell}`
        };
      }
      
      // Check current allowance
      const currentAllowance = await tokenContract.allowance(signer.address, config.contracts.sell);
      console.log(`Current allowance: ${ethers.formatUnits(currentAllowance, config.token.decimals)}`);
      console.log(`Sell contract address: ${config.contracts.sell}`);
      
      // First approve the sell contract to spend tokens
      console.log('Approving sell contract to spend tokens...');
      const approveTx = await tokenContract.approve(config.contracts.sell, amount, {
        gasLimit: 200000
      });
      const approveReceipt = await approveTx.wait();
      console.log('Approval successful, status:', approveReceipt.status);
      
      if (approveReceipt.status === 0) {
        return {
          success: false,
          error: '❌ Token approval failed!\n\nPlease try again.'
        };
      }
      
      // Verify approval was set correctly
      const verifyAllowance = await tokenContract.allowance(signer.address, config.contracts.sell);
      console.log('Verified allowance after approval:', ethers.formatUnits(verifyAllowance, config.token.decimals));
      
      if (verifyAllowance < amount) {
        return {
          success: false,
          error: '❌ Approval verification failed!\n\nThe allowance was not set correctly. Please try again.'
        };
      }
      
      // Then sell the tokens
      console.log('Calling sellTokens() with amount:', amount.toString());
      console.log('Sell contract address:', config.contracts.sell);
      console.log('Token contract address:', config.contracts.token);
      
      const tx = await sellContract.sellTokens(amount, {
        gasLimit: 1000000
      });
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction mined in block:', receipt.blockNumber);
      console.log('Transaction status:', receipt.status);
      console.log('Gas used:', receipt.gasUsed.toString());

      if (receipt.status === 0) {
        return {
          success: false,
          error: '❌ Transaction reverted!\n\nPossible reasons:\n• Sell contract may not have enough HBAR\n• Contract may be paused\n\nPlease contact the admin.'
        };
      }

      return {
        success: true,
        txHash: receipt.hash,
        hbarReceived: ethers.formatEther(hbarToReceive)
      };
    } catch (error) {
      console.error('Sell tokens error:', error);
      
      let errorMessage = 'Transaction failed';
      
      if (error.message && error.message.includes('Insufficient HBAR in contract')) {
        errorMessage = '❌ Sell contract is out of HBAR!\n\nPlease contact the admin to refill.';
      } else if (error.message && error.message.includes('Below minimum sell amount')) {
        errorMessage = '⚠️ Sell amount is below minimum!\n\nTry selling more tokens.';
      } else if (error.message && error.message.includes('Exceeds maximum sell amount')) {
        errorMessage = '⚠️ Sell amount exceeds maximum!\n\nTry selling fewer tokens.';
      } else if (error.code === 'CALL_EXCEPTION' && error.receipt?.status === 0) {
        errorMessage = '❌ Smart contract rejected the transaction!\n\n' +
                      'Possible reasons:\n' +
                      '• Sell contract doesn\'t have enough HBAR\n' +
                      '• Amount is outside min/max limits\n' +
                      '• Contract is paused\n\n' +
                      'Please contact the contract owner/admin.';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = '⚠️ Insufficient HBAR for gas fees.\n\nUse /hbarfaucet to get test HBAR!';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Format token amount for display
   */
  formatTokenAmount(amount) {
    return `${parseFloat(amount).toFixed(2)} ${config.token.symbol}`;
  }

  /**
   * Format transaction hash for display
   */
  formatTxHash(hash) {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  }

  /**
   * Send HEDGY tokens to another address
   */
  async sendHedgyTokens(privateKey, toAddress, amount) {
    try {
      const signer = this.getSigner(privateKey);
      const tokenContract = this.getContract('token', signer);
      
      const tokenAmount = ethers.parseUnits(amount.toString(), config.token.decimals);
      
      // Check sender balance
      const balance = await tokenContract.balanceOf(signer.address);
      
      if (balance < tokenAmount) {
        const userBalance = ethers.formatUnits(balance, config.token.decimals);
        return {
          success: false,
          error: `⚠️ Insufficient ${config.token.symbol}!\n\nYou need ${amount} ${config.token.symbol} but only have ${parseFloat(userBalance).toFixed(2)} ${config.token.symbol}.`
        };
      }
      
      // Validate recipient address
      if (!ethers.isAddress(toAddress)) {
        return {
          success: false,
          error: '❌ Invalid recipient address!\n\nPlease check the address and try again.'
        };
      }
      
      // Send tokens
      console.log(`Sending ${amount} ${config.token.symbol} to ${toAddress}`);
      const tx = await tokenContract.transfer(toAddress, tokenAmount, {
        gasLimit: 100000
      });
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction status:', receipt.status);
      
      if (receipt.status === 0) {
        return {
          success: false,
          error: '❌ Transaction reverted! Please try again.'
        };
      }
      
      return {
        success: true,
        txHash: receipt.hash,
        amount: amount,
        recipient: toAddress
      };
    } catch (error) {
      console.error('Send HEDGY error:', error);
      
      let errorMessage = 'Transaction failed';
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = '⚠️ Insufficient HBAR for gas fees!\n\nUse /hbarfaucet to get test HBAR.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Send HBAR to another address
   */
  async sendHbar(privateKey, toAddress, amount) {
    try {
      const signer = this.getSigner(privateKey);
      const value = ethers.parseEther(amount.toString());
      
      // Check sender balance
      const balance = await this.provider.getBalance(signer.address);
      
      // Need to account for gas
      const estimatedGas = 21000n * 430000000000n; // 21000 gas * gas price
      
      if (balance < value + estimatedGas) {
        const userBalance = ethers.formatEther(balance);
        return {
          success: false,
          error: `⚠️ Insufficient HBAR!\n\nYou need ${amount} HBAR + gas but only have ${parseFloat(userBalance).toFixed(4)} HBAR.\n\nUse /hbarfaucet to get more!`
        };
      }
      
      // Validate recipient address
      if (!ethers.isAddress(toAddress)) {
        return {
          success: false,
          error: '❌ Invalid recipient address!\n\nPlease check the address and try again.'
        };
      }
      
      // Send HBAR
      console.log(`Sending ${amount} HBAR to ${toAddress}`);
      const tx = await signer.sendTransaction({
        to: toAddress,
        value: value,
        gasLimit: 21000
      });
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction status:', receipt.status);
      
      if (receipt.status === 0) {
        return {
          success: false,
          error: '❌ Transaction reverted! Please try again.'
        };
      }
      
      return {
        success: true,
        txHash: receipt.hash,
        amount: amount,
        recipient: toAddress
      };
    } catch (error) {
      console.error('Send HBAR error:', error);
      
      let errorMessage = 'Transaction failed';
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = '⚠️ Insufficient HBAR!\n\nYou need more HBAR to cover the amount + gas fees.\n\nUse /hbarfaucet to get test HBAR.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}

module.exports = new ContractService();
