# 🦔 HedgyBot - Telegram DeFi Bot for Hedera Network

A sleek Telegram bot that enables users to interact with DeFi features on the Hedera Testnet.

## 🌟 Features

- 🪙 **Buy & Sell HEDGY Tokens**: Trade tokens directly through Telegram
- 💧 **Token Faucet**: Get test HEDGY tokens (100 HEDGY per 24 hours)
- 💰 **Balance Check**: View your HEDGY and HBAR balances
- 🔑 **Auto Wallet Generation**: Each user gets a unique wallet automatically
- 🔐 **Export Private Key**: Users can export and save their private keys
- 🌊 **Hedera Testnet Faucet**: Get test HBAR for transactions

## 🚀 Quick Start

### Prerequisites

- Node.js v16 or higher
- A Telegram Bot Token (get from [@BotFather](https://t.me/botfather))

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Telegram Bot Token to `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your_actual_token_here
   ```

5. Run the bot:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## 📱 How to Get a Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Copy the token provided by BotFather
5. Paste it in your `.env` file

## 🎮 Bot Commands

- `/start` - Welcome message and wallet creation
- `/balance` - Check your HEDGY and HBAR balance
- `/faucet` - Get free HEDGY tokens (once per 24h)
- `/buy` - Buy HEDGY tokens with HBAR
- `/send` - Send HEDGY tokens or HBAR to an address
- `/sell` - Sell HEDGY tokens for HBAR
- `/wallet` - View your wallet address
- `/export` - Export your private key (⚠️ Keep it safe!)
- `/hbarfaucet` - Get test HBAR from Hedera faucet
- `/help` - Show all available commands

## 🏗️ Project Structure

```
bot/
├── src/
│   ├── index.js              # Main bot entry point
│   ├── config/
│   │   └── contracts.js      # Smart contract configurations
│   ├── services/
│   │   ├── walletService.js  # Wallet management
│   │   ├── contractService.js # Smart contract interactions
│   │   └── hederaService.js  # Hedera network services
│   ├── handlers/
│   │   ├── commandHandler.js # Command processing
│   │   └── callbackHandler.js # Inline button callbacks
│   └── utils/
│       ├── database.js       # User data storage
│       └── keyboards.js      # Telegram inline keyboards
├── data/                     # User wallet storage (git-ignored)
├── .env                      # Environment variables (git-ignored)
└── package.json
```

## ⚠️ Security Notes

- This is for **TESTNET ONLY** - never use this pattern on mainnet
- Private keys are stored locally - in production, use proper encryption
- Users should export and backup their private keys
- Never share your `.env` file or private keys

## 🧪 Testing

This bot operates on Hedera Testnet. Get test HBAR from:
- Bot command: `/hbarfaucet`
- Web faucet: https://portal.hedera.com/

## 📄 License

MIT
