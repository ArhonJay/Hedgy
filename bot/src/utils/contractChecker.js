const { ethers } = require('ethers');
const { config } = require('../config/contracts');

/**
 * Utility to check contract deployment and basic info
 */
class ContractChecker {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
  }

  /**
   * Check if a contract exists at an address
   */
  async checkContract(address, name) {
    try {
      const code = await this.provider.getCode(address);
      const exists = code !== '0x';
      
      console.log(`\n${name} Contract (${address}):`);
      console.log(`  ✓ Exists: ${exists}`);
      
      if (exists) {
        const balance = await this.provider.getBalance(address);
        console.log(`  ✓ Balance: ${ethers.formatEther(balance)} HBAR`);
      }
      
      return exists;
    } catch (error) {
      console.error(`  ✗ Error checking ${name}:`, error.message);
      return false;
    }
  }

  /**
   * Check all deployed contracts
   */
  async checkAllContracts() {
    console.log('='.repeat(50));
    console.log('CHECKING SMART CONTRACTS ON HEDERA TESTNET');
    console.log('='.repeat(50));

    await this.checkContract(config.contracts.token, 'Token');
    await this.checkContract(config.contracts.faucet, 'Faucet');
    await this.checkContract(config.contracts.buy, 'Buy');
    await this.checkContract(config.contracts.sell, 'Sell');

    console.log('='.repeat(50));
    console.log('\n');
  }
}

// Run check if this file is executed directly
if (require.main === module) {
  const checker = new ContractChecker();
  checker.checkAllContracts().then(() => {
    console.log('Contract check complete!');
    process.exit(0);
  }).catch(error => {
    console.error('Error during contract check:', error);
    process.exit(1);
  });
}

module.exports = ContractChecker;
