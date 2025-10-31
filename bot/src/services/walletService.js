const { ethers } = require('ethers');
const database = require('../utils/database');

class WalletService {
  /**
   * Get or create a wallet for a Telegram user
   */
  async getOrCreateWallet(telegramId, username = null) {
    // Check if user already has a wallet
    let user = database.getUser(telegramId);
    
    if (user) {
      return {
        address: user.walletAddress,
        privateKey: user.privateKey,
        isNew: false
      };
    }
    
    // Generate a new wallet
    const wallet = ethers.Wallet.createRandom();
    
    // Store in database
    user = database.createUser(
      telegramId,
      wallet.address,
      wallet.privateKey,
      username
    );
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      isNew: true
    };
  }

  /**
   * Get wallet for a user
   */
  getWallet(telegramId) {
    const user = database.getUser(telegramId);
    if (!user) return null;
    
    return new ethers.Wallet(user.privateKey);
  }

  /**
   * Get wallet address for a user
   */
  getWalletAddress(telegramId) {
    const user = database.getUser(telegramId);
    return user ? user.walletAddress : null;
  }

  /**
   * Get private key for a user
   */
  getPrivateKey(telegramId) {
    const user = database.getUser(telegramId);
    return user ? user.privateKey : null;
  }

  /**
   * Format address for display (shortened)
   */
  formatAddress(address) {
    if (!address) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  /**
   * Validate if address is valid
   */
  isValidAddress(address) {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      return false;
    }
  }
}

module.exports = new WalletService();
