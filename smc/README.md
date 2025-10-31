# Hedgy Smart Contracts 🦔

A complete smart contract system for the Hedera Network featuring token management, faucet, buying, and selling functionality with robust security measures.

## 📋 Features

- **HedgyToken (Token.sol)**: ERC20 token with advanced security features
  - Mintable and burnable
  - Pausable transfers
  - Blacklist functionality
  - Max supply cap (1 billion tokens)
  - Ownership management

- **TokenFaucet (Faucet.sol)**: Distribute test tokens with cooldown
  - Configurable drip amounts
  - Cooldown period management
  - Balance tracking
  - Pausable

- **TokenBuy (Buy.sol)**: Purchase tokens with HBAR
  - Configurable pricing
  - Min/max purchase limits
  - HBAR payment handling
  - Owner fund management

- **TokenSell (Sell.sol)**: Sell tokens back for HBAR
  - Buyback mechanism
  - Price configuration
  - Min/max sell limits
  - HBAR liquidity management

## 🛠️ Tech Stack

- **Solidity** 0.8.20
- **Hardhat** - Development framework
- **OpenZeppelin** - Secure smart contract library
- **Hedera Network** - Target blockchain (testnet)

## 🔒 Security Features

✅ ReentrancyGuard on all value transfers
✅ Pausable functionality for emergency stops
✅ Access control with Ownable
✅ Blacklist mechanism for compliance
✅ Input validation on all functions
✅ Safe math operations (Solidity 0.8+)

## 📦 Installation

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- Hedera testnet account

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file with your credentials:**
   - Add your Hedera testnet private key
   - Configure token parameters
   - Set contract parameters

## 🚀 Deployment

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Deploy to Hedera Testnet

```bash
npm run deploy:testnet
```

This will:
1. Deploy HedgyToken
2. Deploy TokenFaucet
3. Deploy TokenBuy
4. Deploy TokenSell
5. Fund contracts with tokens
6. Save deployment addresses to `deployments.json`

### Deploy to Local Network

```bash
# Start local node
npm run node

# In another terminal
npm run deploy:localhost
```

## 📝 Usage Examples

### Interact with Contracts

```bash
node scripts/interact.js
```

### Request Tokens from Faucet

```javascript
const faucet = await ethers.getContractAt("TokenFaucet", FAUCET_ADDRESS);
await faucet.requestTokens();
```

### Buy Tokens

```javascript
const buy = await ethers.getContractAt("TokenBuy", BUY_ADDRESS);
const hbarAmount = ethers.parseEther("1"); // 1 HBAR
await buy.buyTokens({ value: hbarAmount });
```

### Sell Tokens

```javascript
const token = await ethers.getContractAt("HedgyToken", TOKEN_ADDRESS);
const sell = await ethers.getContractAt("TokenSell", SELL_ADDRESS);

const amount = ethers.parseEther("100"); // 100 tokens
await token.approve(SELL_ADDRESS, amount);
await sell.sellTokens(amount);
```

## 🔗 Hedera Network Details

### Testnet
- **Chain ID**: 296
- **RPC URL**: https://testnet.hashio.io/api
- **Explorer**: https://hashscan.io/testnet

### Mainnet
- **Chain ID**: 295
- **RPC URL**: https://mainnet.hashio.io/api
- **Explorer**: https://hashscan.io/mainnet

## 📊 Contract Architecture

```
┌─────────────────┐
│   HedgyToken    │
│   (ERC20)       │
└────────┬────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         │              │              │              │
    ┌────▼────┐    ┌───▼────┐    ┌───▼────┐    ┌───▼────┐
    │ Faucet  │    │  Buy   │    │  Sell  │    │ Users  │
    │         │    │        │    │        │    │        │
    └─────────┘    └────────┘    └────────┘    └────────┘
```

## 🔧 Configuration

### Token Configuration (.env)
```env
TOKEN_NAME=HedgyToken
TOKEN_SYMBOL=HEDGY
INITIAL_SUPPLY=1000000000000000000000000  # 1M tokens
```

### Faucet Configuration (.env)
```env
FAUCET_DRIP_AMOUNT=100000000000000000000   # 100 tokens
FAUCET_COOLDOWN_TIME=86400                 # 24 hours
```

### Buy/Sell Configuration (.env)
```env
BUY_TOKEN_PRICE=1000000000000000           # 0.001 HBAR
SELL_TOKEN_PRICE=900000000000000           # 0.0009 HBAR
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run with coverage:

```bash
npm run coverage
```

## 📜 Contract Addresses (Testnet)

After deployment, find your contract addresses in:
- `deployments.json`
- Console output
- HashScan explorer

## 🛡️ Security Considerations

1. **Private Keys**: Never commit `.env` file
2. **Testnet Only**: Current configuration is for testnet
3. **Audits**: Consider professional audit before mainnet
4. **Access Control**: Only owner can perform admin functions
5. **Pausable**: Emergency stop functionality available

## 📚 Resources

- [Hedera Documentation](https://docs.hedera.com/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Solidity Documentation](https://docs.soliditylang.org/)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## ⚠️ Disclaimer

This code is provided as-is for educational and development purposes. Always conduct thorough testing and security audits before deploying to mainnet.

## 🆘 Support

For issues or questions:
1. Check the documentation
2. Review existing issues on GitHub
3. Create a new issue with detailed information

---

Built with ❤️ for the Hedera Network
