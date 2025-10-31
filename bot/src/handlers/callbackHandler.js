const walletService = require('../services/walletService');
const contractService = require('../services/contractService');
const keyboards = require('../utils/keyboards');
const commandHandler = require('./commandHandler');
const { config } = require('../config/contracts');

class CallbackHandler {
  /**
   * Handle inline button callbacks
   */
  async handleCallback(bot, query) {
    // Extract chatId early for error handling
    const chatId = query.message?.chat?.id;
    
    try {
      // Debug log the entire query structure
      console.log('Query received:', JSON.stringify(query, null, 2));

      // Acknowledge the callback first
      await bot.answerCallbackQuery(query.id);

      // Safe extraction with null checks
      if (!query.message || !query.message.chat) {
        console.error('Invalid query structure - no message or chat');
        return;
      }

      const userId = query.from.id;
      const data = query.data || query.callback_data;

      // Guard against undefined data
      if (!data) {
        console.error('Callback data is undefined. Query:', query);
        await bot.sendMessage(chatId, '❌ Invalid callback data. Please try again.');
        return;
      }

      console.log('Processing callback:', data);

      // Route to appropriate handler
      switch (data) {
        case 'menu':
          await this.handleMenu(bot, chatId, query.message.message_id);
          break;
        case 'balance':
          await this.handleBalance(bot, chatId, userId, query.message.message_id);
          break;
        case 'faucet':
          await this.handleFaucet(bot, chatId, userId, query.message.message_id);
          break;
        case 'buy':
          await this.handleBuyMenu(bot, chatId, query.message.message_id);
          break;
        case 'sell':
          await this.handleSellMenu(bot, chatId, query.message.message_id);
          break;
        case 'wallet':
          await this.handleWallet(bot, chatId, userId, query.message.message_id);
          break;
        case 'export_key':
          await this.handleExportKey(bot, chatId, userId, query.message.message_id);
          break;
        case 'confirm_export':
          await this.handleConfirmExport(bot, chatId, userId, query.message.message_id);
          break;
        case 'hbar_faucet':
          await this.handleHbarFaucet(bot, chatId, userId, query.message.message_id);
          break;
        case 'help':
          await this.handleHelp(bot, chatId, query.message.message_id);
          break;
        case 'send':
          await this.handleSendMenu(bot, chatId, userId, query.message.message_id);
          break;
        case 'send_hedgy':
          await this.handleSendHedgyPrompt(bot, chatId, userId, query.message.message_id);
          break;
        case 'send_hbar':
          await this.handleSendHbarPrompt(bot, chatId, userId, query.message.message_id);
          break;
        default:
          // Handle buy/sell amounts
          if (data.startsWith('buy_')) {
            const amount = data.replace('buy_', '');
            await this.handleBuyExecute(bot, chatId, userId, amount, query.message.message_id);
          } else if (data.startsWith('sell_')) {
            const amount = data.replace('sell_', '');
            await this.handleSellExecute(bot, chatId, userId, amount, query.message.message_id);
          }
          break;
      }
    } catch (error) {
      console.error('Callback handler error:', error);
      if (chatId) {
        await bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
      }
    }
  }

  async handleMenu(bot, chatId, messageId) {
    const message = `🦔 *HedgyBot Main Menu*\n\nSelect an option:`;
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      ...keyboards.mainMenu
    });
  }

  async handleBalance(bot, chatId, userId, messageId) {
    const address = walletService.getWalletAddress(userId);
    if (!address) {
      await bot.editMessageText('❌ No wallet found. Use /start to create one.', {
        chat_id: chatId,
        message_id: messageId
      });
      return;
    }

    await bot.editMessageText('⏳ Fetching balances...', {
      chat_id: chatId,
      message_id: messageId
    });

    const [tokenBalance, hbarBalance] = await Promise.all([
      contractService.getTokenBalance(address),
      contractService.getHbarBalance(address)
    ]);

    const message =
      `💰 *Your Balances*\n\n` +
      `🦔 ${config.token.symbol}: ${parseFloat(tokenBalance).toFixed(2)}\n` +
      `💎 HBAR: ${parseFloat(hbarBalance).toFixed(4)}\n\n` +
      `👛 Wallet: \`${walletService.formatAddress(address)}\``;

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      ...keyboards.backToMenu
    });
  }

  async handleFaucet(bot, chatId, userId, messageId) {
    // Use the command handler's faucet logic
    const mockMsg = { chat: { id: chatId }, from: { id: userId } };
    await commandHandler.handleFaucet(bot, mockMsg);
    
    // Delete the old message
    try {
      await bot.deleteMessage(chatId, messageId);
    } catch (e) {
      // Ignore if already deleted
    }
  }

  async handleBuyMenu(bot, chatId, messageId) {
    const message =
      `🛒 *Buy ${config.token.symbol} Tokens*\n\n` +
      `Select the amount of HBAR you want to spend:`;

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      ...keyboards.buyAmounts
    });
  }

  async handleBuyExecute(bot, chatId, userId, amount, messageId) {
    const privateKey = walletService.getPrivateKey(userId);
    if (!privateKey) {
      await bot.editMessageText('❌ No wallet found. Use /start to create one.', {
        chat_id: chatId,
        message_id: messageId
      });
      return;
    }

    await bot.editMessageText(`⏳ Processing purchase of ${amount} HBAR worth of ${config.token.symbol}...`, {
      chat_id: chatId,
      message_id: messageId
    });

    const result = await contractService.buyTokens(privateKey, amount);

    if (result.success) {
      const tokensInfo = result.tokensReceived 
        ? `You received: ~${parseFloat(result.tokensReceived).toFixed(2)} ${config.token.symbol}\n`
        : '';
      
      const message =
        `✅ *Purchase Successful!*\n\n` +
        `You spent: ${amount} HBAR\n` +
        tokensInfo +
        `📝 Transaction: \`${contractService.formatTxHash(result.txHash)}\`\n\n` +
        `Check your balance with /balance`;

      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        ...keyboards.backToMenu
      });
    } else {
      await bot.editMessageText(
        `❌ *Purchase Failed*\n\n${result.error}\n\nMake sure you have enough HBAR!`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          ...keyboards.backToMenu
        }
      );
    }
  }

  async handleSellMenu(bot, chatId, messageId) {
    const message =
      `💸 *Sell ${config.token.symbol} Tokens*\n\n` +
      `Select the amount of ${config.token.symbol} you want to sell:`;

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      ...keyboards.sellAmounts
    });
  }

  async handleSellExecute(bot, chatId, userId, amount, messageId) {
    const privateKey = walletService.getPrivateKey(userId);
    if (!privateKey) {
      await bot.editMessageText('❌ No wallet found. Use /start to create one.', {
        chat_id: chatId,
        message_id: messageId
      });
      return;
    }

    await bot.editMessageText(`⏳ Processing sale of ${amount} ${config.token.symbol}...`, {
      chat_id: chatId,
      message_id: messageId
    });

    const result = await contractService.sellTokens(privateKey, amount);

    if (result.success) {
      const message =
        `✅ *Sale Successful!*\n\n` +
        `You sold: ${amount} ${config.token.symbol}\n` +
        `📝 Transaction: \`${contractService.formatTxHash(result.txHash)}\`\n\n` +
        `Check your balance with /balance`;

      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        ...keyboards.backToMenu
      });
    } else {
      await bot.editMessageText(
        `❌ *Sale Failed*\n\n${result.error}\n\nMake sure you have enough ${config.token.symbol}!`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          ...keyboards.backToMenu
        }
      );
    }
  }

  async handleWallet(bot, chatId, userId, messageId) {
    const mockMsg = { chat: { id: chatId }, from: { id: userId } };
    await commandHandler.handleWallet(bot, mockMsg);
    
    try {
      await bot.deleteMessage(chatId, messageId);
    } catch (e) {
      // Ignore
    }
  }

  async handleExportKey(bot, chatId, userId, messageId) {
    const message =
      `⚠️ *SECURITY WARNING*\n\n` +
      `You are about to export your private key.\n\n` +
      `*Never share your private key with anyone!*\n\n` +
      `Anyone with your private key has full access to your wallet and funds.\n\n` +
      `Are you sure you want to continue?`;

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      ...keyboards.confirmExport
    });
  }

  async handleConfirmExport(bot, chatId, userId, messageId) {
    const privateKey = walletService.getPrivateKey(userId);
    if (!privateKey) {
      await bot.editMessageText('❌ No wallet found. Use /start to create one.', {
        chat_id: chatId,
        message_id: messageId
      });
      return;
    }

    // Delete the confirmation message
    try {
      await bot.deleteMessage(chatId, messageId);
    } catch (e) {
      // Ignore
    }

    // Send private key in a separate message that can be deleted
    const message =
      `🔑 *Your Private Key*\n\n` +
      `\`${privateKey}\`\n\n` +
      `⚠️ *IMPORTANT:*\n` +
      `• Save this somewhere safe\n` +
      `• Never share it with anyone\n` +
      `• Delete this message after saving\n\n` +
      `This message will self-destruct in 60 seconds.`;

    const keyMsg = await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });

    // Auto-delete after 60 seconds
    setTimeout(async () => {
      try {
        await bot.deleteMessage(chatId, keyMsg.message_id);
      } catch (e) {
        // Message might be already deleted by user
      }
    }, 60000);

    // Send follow-up menu
    await bot.sendMessage(chatId, '🦔 *Main Menu*', keyboards.mainMenu);
  }

  async handleHbarFaucet(bot, chatId, userId, messageId) {
    const address = walletService.getWalletAddress(userId);
    if (!address) {
      await bot.editMessageText('❌ No wallet found. Use /start to create one.', {
        chat_id: chatId,
        message_id: messageId
      });
      return;
    }

    const message =
      `🌊 *Get Test HBAR*\n\n` +
      `To get test HBAR for transactions, visit:\n` +
      `🔗 [Hedera Testnet Faucet](https://portal.hedera.com/faucet)\n\n` +
      `Your wallet address:\n\`${address}\`\n\n` +
      `📋 *Instructions:*\n` +
      `1. Click the link above\n` +
      `2. Paste your wallet address\n` +
      `3. Complete the captcha\n` +
      `4. Receive 10,000 test HBAR!\n\n` +
      `You'll need HBAR for gas fees to use the ${config.token.symbol} faucet and trade tokens.`;

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      ...keyboards.backToMenu
    });
  }

  async handleHelp(bot, chatId, messageId) {
    const message =
      `🦔 *HedgyBot Help*\n\n` +
      `*Available Commands:*\n\n` +
      `/start - Create wallet & show menu\n` +
      `/balance - Check your balances\n` +
      `/faucet - Get free ${config.token.symbol} tokens\n` +
      `/buy - Buy ${config.token.symbol} with HBAR\n` +
      `/sell - Sell ${config.token.symbol} for HBAR\n` +
      `/wallet - View your wallet\n` +
      `/export - Export private key\n` +
      `/hbarfaucet - Get test HBAR\n` +
      `/send - Send HBAR or ${config.token.symbol}\n` +
      `/help - Show this message\n\n` +
      `*Quick Start:*\n` +
      `1. Get test HBAR from /hbarfaucet\n` +
      `2. Claim ${config.token.symbol} from /faucet\n` +
      `3. Trade using /buy or /sell\n\n` +
      `⚠️ This is Hedera Testnet - for testing only!`;

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      ...keyboards.backToMenu
    });
  }

  async handleSendMenu(bot, chatId, userId, messageId) {
    const address = walletService.getWalletAddress(userId);
    if (!address) {
      await bot.editMessageText('❌ No wallet found. Use /start to create one.', {
        chat_id: chatId,
        message_id: messageId
      });
      return;
    }

    const message = 
      `📤 *Send Tokens*\n\n` +
      `What would you like to send?`;

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💎 Send HEDGY', callback_data: 'send_hedgy' },
            { text: '💰 Send HBAR', callback_data: 'send_hbar' }
          ],
          [
            { text: '🔙 Back to Menu', callback_data: 'menu' }
          ]
        ]
      }
    });
  }

  async handleSendHedgyPrompt(bot, chatId, userId, messageId) {
    const message = 
      `📤 *Send ${config.token.symbol} Tokens*\n\n` +
      `Please send the details in this format:\n` +
      `\`recipient_address amount\`\n\n` +
      `*Example:*\n` +
      `\`0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 100\`\n\n` +
      `This will send 100 ${config.token.symbol} to the address.`;

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      ...keyboards.backToMenu
    });

    // Store state to expect send input
    this.pendingSends = this.pendingSends || {};
    this.pendingSends[userId] = { type: 'hedgy', chatId };
  }

  async handleSendHbarPrompt(bot, chatId, userId, messageId) {
    const message = 
      `📤 *Send HBAR*\n\n` +
      `Please send the details in this format:\n` +
      `\`recipient_address amount\`\n\n` +
      `*Example:*\n` +
      `\`0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 10\`\n\n` +
      `This will send 10 HBAR to the address.`;

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      ...keyboards.backToMenu
    });

    // Store state to expect send input
    this.pendingSends = this.pendingSends || {};
    this.pendingSends[userId] = { type: 'hbar', chatId };
  }
}

module.exports = new CallbackHandler();
