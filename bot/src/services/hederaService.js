const axios = require('axios');

class HederaService {
  constructor() {
    this.faucetUrl = 'https://portal.hedera.com/faucet';
    this.explorerUrl = 'https://hashscan.io/testnet';
  }

  /**
   * Request HBAR from Hedera testnet faucet
   */
  async requestHbarFaucet(address) {
    try {
      // Note: The actual Hedera faucet endpoint may vary
      // This is a placeholder implementation
      const response = await axios.post(
        'https://faucet.hedera.com/api/v1/accounts',
        {
          address: address
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        txHash: response.data.txHash || 'N/A',
        amount: '100 HBAR'
      };
    } catch (error) {
      console.error('Hedera faucet error:', error.message);
      
      // Return instructions for manual faucet
      return {
        success: false,
        message: 'Automated faucet unavailable. Please use the web faucet.',
        manualUrl: 'https://portal.hedera.com/'
      };
    }
  }

  /**
   * Get transaction explorer URL
   */
  getExplorerUrl(txHash) {
    return `${this.explorerUrl}/transaction/${txHash}`;
  }

  /**
   * Get account explorer URL
   */
  getAccountUrl(address) {
    return `${this.explorerUrl}/account/${address}`;
  }

  /**
   * Format HBAR amount
   */
  formatHbar(amount) {
    return `${parseFloat(amount).toFixed(4)} HBAR`;
  }
}

module.exports = new HederaService();
