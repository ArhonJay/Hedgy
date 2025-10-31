# 🚀 HedgyBot Setup Guide

## Step-by-Step Guide to Getting Your Bot Running

### Phase 1: Get Your Telegram Bot Token

1. **Open Telegram** on your phone or desktop
2. **Search for @BotFather** (the official bot creation bot)
3. **Send this command:** `/newbot`
4. **Choose a name** for your bot (e.g., "HedgyBot")
5. **Choose a username** (must end with 'bot', e.g., "hedgy_defi_bot")
6. **Copy the token** BotFather gives you (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Phase 2: Install Dependencies

Open your terminal in the bot folder and run:

```bash
npm install
```

This will install all required packages:
- `node-telegram-bot-api` - Telegram bot framework
- `ethers` - Ethereum/Hedera blockchain interactions
- `dotenv` - Environment variable management
- `@hashgraph/sdk` - Hedera SDK
- `axios` - HTTP requests

### Phase 3: Configure Environment

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** and add your bot token:
   ```
   TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE
   ```

3. **All other settings are pre-configured** for your deployed contracts!

### Phase 4: Run the Bot

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
✅ HedgyBot is running!
📱 Ready to receive messages on Telegram
```

### Phase 5: Test Your Bot

1. **Open Telegram** and search for your bot username
2. **Send** `/start`
3. **You should see** a welcome message with inline buttons
4. **A wallet is automatically created** for you!

---

## 🎮 How to Use the Bot

### User Flow

1. **Start:** `/start` - Creates your wallet automatically
2. **Get HBAR:** Click "🌊 Get HBAR" - Visit Hedera faucet to get test HBAR
3. **Claim Tokens:** Click "💧 Faucet" - Get 100 free HEDGY tokens
4. **Check Balance:** Click "💰 Balance" - See your HEDGY and HBAR
5. **Trade:** Use "🛒 Buy HEDGY" or "💸 Sell HEDGY"
6. **Backup:** Click "🔑 Export Key" - Save your private key

### Important Features

#### Auto Wallet Generation
- Each user gets a unique wallet when they start
- Private keys stored locally (testnet only!)
- Users can export their private key anytime

#### Faucet Cooldown
- Users can claim 100 HEDGY every 24 hours
- Prevents abuse
- Shows time remaining if cooldown active

#### Inline Keyboards
- Beautiful button-based interface
- No need to type commands
- User-friendly navigation

#### Transaction Feedback
- Loading indicators during transactions
- Success/failure messages
- Transaction hash display

---

## 🏗️ Architecture Overview

### Project Structure

```
bot/
├── src/
│   ├── index.js                    # Bot entry point
│   ├── config/
│   │   └── contracts.js            # Smart contract config & ABIs
│   ├── services/
│   │   ├── walletService.js        # Wallet creation & management
│   │   ├── contractService.js      # Blockchain interactions
│   │   └── hederaService.js        # Hedera-specific features
│   ├── handlers/
│   │   ├── commandHandler.js       # Process text commands
│   │   └── callbackHandler.js      # Process button clicks
│   └── utils/
│       ├── database.js             # User data persistence
│       └── keyboards.js            # Telegram UI layouts
```

### Data Flow

```
User Message/Button Click
        ↓
Telegram API (polling)
        ↓
Bot Handler (index.js)
        ↓
Command/Callback Handler
        ↓
Service Layer (wallet/contract/hedera)
        ↓
Blockchain (Hedera Testnet)
        ↓
Response to User
```

---

## 🔧 Customization

### Change Token Amounts

Edit `src/config/contracts.js`:
```javascript
faucet: {
  dripAmount: '200000000000000000000', // 200 HEDGY instead of 100
  cooldown: 43200 // 12 hours instead of 24
}
```

### Add New Commands

1. Create handler in `src/handlers/commandHandler.js`
2. Register in `src/index.js`:
   ```javascript
   bot.onText(/\/mycommand/, (msg) => commandHandler.handleMyCommand(bot, msg));
   ```

### Modify Inline Keyboards

Edit `src/utils/keyboards.js` to change button layouts:
```javascript
const myKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '🎯 Button 1', callback_data: 'action1' },
        { text: '🎯 Button 2', callback_data: 'action2' }
      ]
    ]
  }
};
```

---

## 🐛 Troubleshooting

### Bot doesn't respond
- **Check:** Is the bot running? (look for "✅ HedgyBot is running!")
- **Check:** Is your bot token correct in `.env`?
- **Check:** Did you send `/start` to the bot first?

### "Error fetching balance"
- **Check:** Is Hedera testnet RPC accessible?
- **Check:** Are contract addresses correct?
- **Try:** Restart the bot

### "Transaction failed"
- **Check:** Does user have HBAR for gas fees?
- **Check:** Does user have enough tokens (for selling)?
- **Try:** Get more HBAR from faucet

### "Polling error"
- **Cause:** Network issues or bot token problems
- **Fix:** Check internet connection and bot token

---

## 🔒 Security Considerations

### ⚠️ TESTNET ONLY
This bot is designed for **Hedera Testnet ONLY**. Never use this pattern on mainnet because:

1. **Private keys are stored in plain text** (in `data/users.json`)
2. **No encryption** on stored keys
3. **No backup/recovery mechanism**
4. **Local file storage** is not secure

### For Production (Mainnet)

You would need:
- Proper key encryption (AES-256 or better)
- Secure key management (HSM or cloud KMS)
- Multi-signature wallets
- Rate limiting
- User authentication
- Database with backups
- Monitoring and alerts

---

## 📱 Next Steps & Future Features

### Immediate Next Steps
1. ✅ Get bot token from BotFather
2. ✅ Install dependencies
3. ✅ Configure `.env`
4. ✅ Run the bot
5. ✅ Test all features

### Potential Enhancements
- **Swap Feature:** Implement token swapping
- **Price Charts:** Show HEDGY price over time
- **Referral System:** Reward users for inviting friends
- **Staking:** Let users stake HEDGY for rewards
- **Notifications:** Alert users about price changes
- **Multi-language:** Support different languages
- **Advanced Trading:** Limit orders, stop-loss
- **Portfolio Tracking:** Track all tokens
- **NFT Support:** Buy/sell NFTs

### Advanced Features
- **Web Dashboard:** View stats on website
- **Analytics:** Track bot usage
- **Admin Panel:** Manage users
- **API Integration:** Connect to exchanges
- **Smart Notifications:** Price alerts
- **Social Features:** User rankings, leaderboards

---

## 🤝 Support & Community

### Common Commands Cheat Sheet

| Command | What it does |
|---------|-------------|
| `/start` | Initialize & show menu |
| `/balance` | Check HEDGY & HBAR balance |
| `/faucet` | Claim 100 HEDGY (24h cooldown) |
| `/wallet` | View wallet address |
| `/export` | Export private key |
| `/hbarfaucet` | Get link to HBAR faucet |
| `/help` | Show all commands |

### Button Interface

The bot uses a sleek button interface for easy navigation:
- 💰 Balance - Quick balance check
- 💧 Faucet - Claim tokens
- 🛒 Buy HEDGY - Purchase with HBAR
- 💸 Sell HEDGY - Sell for HBAR
- 👛 My Wallet - Wallet info
- 🌊 Get HBAR - HBAR faucet link
- 🔑 Export Key - Backup private key
- ℹ️ Help - Command list

---

## 📄 License

MIT License - Feel free to modify and use for your projects!

---

## 🎉 Congratulations!

You now have a fully functional Telegram DeFi bot running on Hedera Network! 

Enjoy building and expanding HedgyBot! 🦔
