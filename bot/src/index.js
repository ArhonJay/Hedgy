require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const commandHandler = require('./handlers/commandHandler');
const callbackHandler = require('./handlers/callbackHandler');

// Validate environment variables
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN is not set in .env file');
  console.error('Please add your Telegram bot token to the .env file');
  process.exit(1);
}

// Create bot instance
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('🦔 HedgyBot is starting...\n');

// Register command handlers
bot.onText(/\/start/, (msg) => commandHandler.handleStart(bot, msg));
bot.onText(/\/balance/, (msg) => commandHandler.handleBalance(bot, msg));
bot.onText(/\/faucet/, (msg) => commandHandler.handleFaucet(bot, msg));
bot.onText(/\/wallet/, (msg) => commandHandler.handleWallet(bot, msg));
bot.onText(/\/export/, (msg) => commandHandler.handleExport(bot, msg));
bot.onText(/\/hbarfaucet/, (msg) => commandHandler.handleHbarFaucet(bot, msg));
bot.onText(/\/status/, (msg) => commandHandler.handleStatus(bot, msg));
bot.onText(/\/send/, (msg) => commandHandler.handleSend(bot, msg));
bot.onText(/\/help/, (msg) => commandHandler.handleHelp(bot, msg));

// Alias commands for convenience
bot.onText(/\/buy/, (msg) => {
  bot.sendMessage(msg.chat.id, '🛒 Use the menu buttons or type /start to access buying options.');
});

bot.onText(/\/sell/, (msg) => {
  bot.sendMessage(msg.chat.id, '💸 Use the menu buttons or type /start to access selling options.');
});

// Register callback query handler (for inline buttons)
bot.on('callback_query', (query) => callbackHandler.handleCallback(bot, query));

// Handle text messages for send functionality
bot.on('message', async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Skip if it's a command
  if (text && text.startsWith('/')) {
    return;
  }
  
  // Check if user has a pending send
  if (callbackHandler.pendingSends && callbackHandler.pendingSends[userId]) {
    const sendInfo = callbackHandler.pendingSends[userId];
    
    try {
      // Parse input: address amount
      const parts = text.trim().split(/\s+/);
      
      if (parts.length !== 2) {
        await bot.sendMessage(chatId, '❌ Invalid format!\n\nPlease use: `address amount`\n\nExample: `0x742d35...bEb 100`', {
          parse_mode: 'Markdown'
        });
        return;
      }
      
      const [toAddress, amount] = parts;
      const amountNum = parseFloat(amount);
      
      if (isNaN(amountNum) || amountNum <= 0) {
        await bot.sendMessage(chatId, '❌ Invalid amount!\n\nPlease enter a positive number.');
        return;
      }
      
      const walletService = require('./services/walletService');
      const contractService = require('./services/contractService');
      
      const privateKey = walletService.getPrivateKey(userId);
      if (!privateKey) {
        await bot.sendMessage(chatId, '❌ No wallet found. Use /start to create one.');
        delete callbackHandler.pendingSends[userId];
        return;
      }
      
      const loadingMsg = await bot.sendMessage(chatId, '⏳ Processing transaction...');
      
      let result;
      if (sendInfo.type === 'hedgy') {
        result = await contractService.sendHedgyTokens(privateKey, toAddress, amountNum);
      } else {
        result = await contractService.sendHbar(privateKey, toAddress, amountNum);
      }
      
      await bot.deleteMessage(chatId, loadingMsg.message_id);
      
      if (result.success) {
        const symbol = sendInfo.type === 'hedgy' ? 'HEDGY' : 'HBAR';
        const message = 
          `✅ *Send Successful!*\n\n` +
          `📤 Sent: ${result.amount} ${symbol}\n` +
          `📍 To: \`${result.recipient}\`\n` +
          `🔗 TX: \`${result.txHash}\`\n\n` +
          `View on HashScan:\nhttps://hashscan.io/testnet/transaction/${result.txHash}`;
        
        await bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        });
      } else {
        await bot.sendMessage(chatId, `❌ *Send Failed*\n\n${result.error}`, {
          parse_mode: 'Markdown'
        });
      }
      
      // Clear pending send
      delete callbackHandler.pendingSends[userId];
      
    } catch (error) {
      console.error('Send processing error:', error);
      await bot.sendMessage(chatId, '❌ An error occurred while processing your send. Please try again.');
      delete callbackHandler.pendingSends[userId];
    }
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.message);
});

bot.on('error', (error) => {
  console.error('❌ Bot error:', error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down HedgyBot gracefully...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down HedgyBot gracefully...');
  bot.stopPolling();
  process.exit(0);
});

console.log('✅ HedgyBot is running!');
console.log('📱 Ready to receive messages on Telegram\n');
console.log('Configuration:');
console.log('- Network:', process.env.HEDERA_NETWORK || 'testnet');
console.log('- Token Contract:', process.env.TOKEN_CONTRACT);
console.log('- Faucet Contract:', process.env.FAUCET_CONTRACT);
console.log('\n💡 Tip: Use /start in Telegram to begin!\n');
