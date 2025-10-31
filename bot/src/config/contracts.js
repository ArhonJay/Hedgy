require('dotenv').config();

const config = {
  network: process.env.HEDERA_NETWORK || 'testnet',
  chainId: process.env.HEDERA_CHAIN_ID || '296',
  rpcUrl: process.env.HEDERA_RPC_URL || 'https://testnet.hashio.io/api',
  
  contracts: {
    token: process.env.TOKEN_CONTRACT || '0xaD1C4E8FeA4baf773507F3F2Ed4760B5CF600d12',
    faucet: process.env.FAUCET_CONTRACT || '0xc9a2e4b31312dA41A8E88A970f5C5425cBa5743d',
    buy: process.env.BUY_CONTRACT || '0x390035f16D46f05E5C036206F43B9d6CdAcfb792',
    sell: process.env.SELL_CONTRACT || '0x2BC357F697dd5bDa0F47f6c8500Fe3a1D7df6C49'
  },
  
  token: {
    name: process.env.TOKEN_NAME || 'HedgyToken',
    symbol: process.env.TOKEN_SYMBOL || 'HEDGY',
    decimals: 18
  },
  
  faucet: {
    dripAmount: process.env.FAUCET_DRIP_AMOUNT || '100000000000000000000', // 100 HEDGY
    cooldown: parseInt(process.env.FAUCET_COOLDOWN) || 86400 // 24 hours in seconds
  }
};

// Minimal ABI for interacting with contracts
const abis = {
  token: [
    'function balanceOf(address account) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)'
  ],
  
  faucet: [
    'function requestTokens() external',
    'function canRequestTokens(address account) view returns (bool)',
    'function timeUntilNextDrip(address account) view returns (uint256)',
    'function dripAmount() view returns (uint256)',
    'function cooldownTime() view returns (uint256)',
    'function lastDripTime(address user) view returns (uint256)',
    'function totalClaimed(address user) view returns (uint256)',
    'function getFaucetBalance() view returns (uint256)',
    'function token() view returns (address)'
  ],
  
  buy: [
    'function buyTokens() payable external',
    'function calculateTokenAmount(uint256 hbarAmount) view returns (uint256)',
    'function calculateHBARCost(uint256 tokenAmount) view returns (uint256)',
    'function tokenPrice() view returns (uint256)',
    'function minPurchase() view returns (uint256)',
    'function maxPurchase() view returns (uint256)',
    'function getTokenBalance() view returns (uint256)',
    'function getHBARBalance() view returns (uint256)',
    'function totalSold() view returns (uint256)',
    'function token() view returns (address)'
  ],
  
  sell: [
    'function sellTokens(uint256 amount) external',
    'function calculateHBARAmount(uint256 tokenAmount) view returns (uint256)',
    'function calculateTokenAmount(uint256 hbarAmount) view returns (uint256)',
    'function tokenPrice() view returns (uint256)',
    'function minSell() view returns (uint256)',
    'function maxSell() view returns (uint256)',
    'function getHBARBalance() view returns (uint256)',
    'function getTokenBalance() view returns (uint256)',
    'function totalBought() view returns (uint256)',
    'function token() view returns (address)'
  ]
};

module.exports = { config, abis };
