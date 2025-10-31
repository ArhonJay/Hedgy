const walletService = require('../services/walletService');
const contractService = require('../services/contractService');
const hederaService = require('../services/hederaService');
const database = require('../utils/database');
const keyboards = require('../utils/keyboards');
const { config } = require('../config/contracts');

class CommandHandler {
  /**
   * Handle /start command
   */
  async handleStart(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;

    try {
      const wallet = await walletService.getOrCreateWallet(userId, username);

      const welcomeMessage = wallet.isNew
        ? `🦔 *Welcome to HedgyBot!*\n\n` +
          `I've created a new wallet for you on Hedera Testnet!\n\n` +
          `🔑 *Your Wallet:*\n\`${wallet.address}\`\n\n` +
          `⚠️ *Important:* This is a testnet wallet. Use /export to backup your private key!\n\n` +
          `Choose an option below to get started:`
        : `🦔 *Welcome back to HedgyBot!*\n\n` +
          `👛 *Your Wallet:*\n\`${wallet.address}\`\n\n` +
          `Choose an option below:`;

      await bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        ...keyboards.mainMenu
      });
    } catch (error) {
      console.error('Start command error:', error);
      await bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
    }
  }

  /**
   * Handle /balance command
   */
  async handleBalance(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const address = walletService.getWalletAddress(userId);
      if (!address) {
        await bot.sendMessage(chatId, '❌ No wallet found. Use /start to create one.');
        return;
      }

      const loadingMsg = await bot.sendMessage(chatId, '⏳ Fetching balances...');

      const [tokenBalance, hbarBalance] = await Promise.all([
        contractService.getTokenBalance(address),
        contractService.getHbarBalance(address)
      ]);

      const message =
        `💰 *Your Balances*\n\n` +
        `🦔 ${config.token.symbol}: ${parseFloat(tokenBalance).toFixed(2)}\n` +
        `💎 HBAR: ${parseFloat(hbarBalance).toFixed(4)}\n\n` +
        `👛 Wallet: \`${walletService.formatAddress(address)}\``;

      await bot.deleteMessage(chatId, loadingMsg.message_id);
      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...keyboards.backToMenu
      });
    } catch (error) {
      console.error('Balance command error:', error);
      await bot.sendMessage(chatId, '❌ Error fetching balance. Please try again.');
    }
  }

  /**
   * Handle /faucet command
   */
  async handleFaucet(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const privateKey = walletService.getPrivateKey(userId);
      if (!privateKey) {
        await bot.sendMessage(chatId, '❌ No wallet found. Use /start to create one.');
        return;
      }

      // Check cooldown
      const canUse = database.canUseFaucet(userId, config.faucet.cooldown);
      if (!canUse) {
        const timeLeft = database.getTimeUntilNextFaucet(userId, config.faucet.cooldown);
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        
        await bot.sendMessage(
          chatId,
          `⏰ *Faucet Cooldown*\n\n` +
          `You can claim again in: ${hours}h ${minutes}m\n\n` +
          `The faucet drips ${config.faucet.dripAmount / 1e18} ${config.token.symbol} every 24 hours.`,
          { parse_mode: 'Markdown', ...keyboards.backToMenu }
        );
        return;
      }

      const loadingMsg = await bot.sendMessage(chatId, '💧 Claiming from faucet...');

      const result = await contractService.claimFaucet(privateKey);

      await bot.deleteMessage(chatId, loadingMsg.message_id);

      if (result.success) {
        database.updateLastFaucetClaim(userId);
        
        await bot.sendMessage(
          chatId,
          `✅ *Faucet Claimed Successfully!*\n\n` +
          `You received: ${result.amount} ${config.token.symbol}\n\n` +
          `📝 Transaction: \`${contractService.formatTxHash(result.txHash)}\`\n\n` +
          `Come back in 24 hours for more!`,
          { parse_mode: 'Markdown', ...keyboards.backToMenu }
        );
      } else {
        await bot.sendMessage(
          chatId,
          `❌ *Faucet Claim Failed*\n\n${result.error}`,
          { parse_mode: 'Markdown', ...keyboards.backToMenu }
        );
      }
    } catch (error) {
      console.error('Faucet command error:', error);
      await bot.sendMessage(chatId, '❌ Error claiming faucet. Please try again.');
    }
  }

  /**
   * Handle /wallet command
   */
  async handleWallet(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const address = walletService.getWalletAddress(userId);
      if (!address) {
        await bot.sendMessage(chatId, '❌ No wallet found. Use /start to create one.');
        return;
      }

      const explorerUrl = hederaService.getAccountUrl(address);

      const message =
        `👛 *Your Wallet*\n\n` +
        `Address:\n\`${address}\`\n\n` +
        `🔍 [View on Explorer](${explorerUrl})\n\n` +
        `⚠️ Use /export to backup your private key!`;

      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...keyboards.backToMenu
      });
    } catch (error) {
      console.error('Wallet command error:', error);
      await bot.sendMessage(chatId, '❌ Error displaying wallet. Please try again.');
    }
  }

  /**
   * Handle /export command
   */
  async handleExport(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const message =
        `⚠️ *SECURITY WARNING*\n\n` +
        `You are about to export your private key.\n\n` +
        `*Never share your private key with anyone!*\n\n` +
        `Anyone with your private key has full access to your wallet and funds.\n\n` +
        `Are you sure you want to continue?`;

      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...keyboards.confirmExport
      });
    } catch (error) {
      console.error('Export command error:', error);
      await bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
    }
  }

  /**
   * Handle /hbarfaucet command
   */
  async handleHbarFaucet(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const address = walletService.getWalletAddress(userId);
      if (!address) {
        await bot.sendMessage(chatId, '❌ No wallet found. Use /start to create one.');
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

      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...keyboards.backToMenu
      });
    } catch (error) {
      console.error('HBAR faucet command error:', error);
      await bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
    }
  }

  /**
   * Handle /help command
   */
  async handleHelp(bot, msg) {
    const chatId = msg.chat.id;

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
      `/status - Check contract status\n` +
      `/help - Show this message\n\n` +
      `*Quick Start:*\n` +
      `1. Get test HBAR from /hbarfaucet\n` +
      `2. Claim ${config.token.symbol} from /faucet\n` +
      `3. Trade using /buy or /sell\n\n` +
      `⚠️ This is Hedera Testnet - for testing only!`;

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      ...keyboards.backToMenu
    });
  }

  /**
   * Handle /status command - Check contract status
   */
  async handleStatus(bot, msg) {
    const chatId = msg.chat.id;

    try {
      const loadingMsg = await bot.sendMessage(chatId, '⏳ Checking contract status...');

      // Get faucet status
      const faucetContract = contractService.getContract('faucet');
      const faucetBalance = await faucetContract.getFaucetBalance();
      const dripAmount = await faucetContract.dripAmount();
      
      // Get buy contract status
      const buyContract = contractService.getContract('buy');
      const buyTokenBalance = await buyContract.getTokenBalance();
      const minPurchase = await buyContract.minPurchase();
      const maxPurchase = await buyContract.maxPurchase();
      const tokenPrice = await buyContract.tokenPrice();
      
      // Get sell contract status
      const sellContract = contractService.getContract('sell');
      const sellHbarBalanceRaw = await sellContract.getHBARBalance();
      // Hedera returns tinybar, convert to wei (multiply by 10^10)
      const sellHbarBalance = sellHbarBalanceRaw * 10000000000n;
      const minSell = await sellContract.minSell();
      const maxSell = await sellContract.maxSell();

      const message =
        `📊 *Contract Status*\n\n` +
        `🚰 *Faucet Contract:*\n` +
        `Balance: ${parseFloat(contractService.formatTokenAmount(ethers.formatEther(faucetBalance)))}\n` +
        `Per Claim: ${parseFloat(contractService.formatTokenAmount(ethers.formatEther(dripAmount)))}\n\n` +
        `🛒 *Buy Contract:*\n` +
        `${config.token.symbol} Available: ${parseFloat(contractService.formatTokenAmount(ethers.formatEther(buyTokenBalance)))}\n` +
        `Price: ${ethers.formatEther(tokenPrice)} HBAR per token\n` +
        `Min/Max: ${parseFloat(ethers.formatEther(minPurchase)).toFixed(0)}-${parseFloat(ethers.formatEther(maxPurchase)).toFixed(0)} ${config.token.symbol}\n\n` +
        `💸 *Sell Contract:*\n` +
        `HBAR Available: ${parseFloat(ethers.formatEther(sellHbarBalance)).toFixed(2)}\n` +
        `Min/Max: ${parseFloat(ethers.formatEther(minSell)).toFixed(0)}-${parseFloat(ethers.formatEther(maxSell)).toFixed(0)} ${config.token.symbol}\n\n` +
        `✅ All contracts operational!`;

      await bot.deleteMessage(chatId, loadingMsg.message_id);
      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        ...keyboards.backToMenu
      });
    } catch (error) {
      console.error('Status command error:', error);
      await bot.sendMessage(chatId, '❌ Error checking contract status. Please try again.');
    }
  }

  /**
   * Handle /send command - Send HBAR or HEDGY tokens
   */
  async handleSend(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const address = walletService.getWalletAddress(userId);
      if (!address) {
        await bot.sendMessage(chatId, '❌ No wallet found. Use /start to create one.');
        return;
      }

      const message = 
        `📤 *Send Tokens*\n\n` +
        `What would you like to send?`;

      await bot.sendMessage(chatId, message, {
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
    } catch (error) {
      console.error('Send command error:', error);
      await bot.sendMessage(chatId, '❌ Error processing send command. Please try again.');
    }
  }
}

module.exports = new CommandHandler();
