// Telegram inline keyboard layouts

const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '💰 Balance', callback_data: 'balance' },
        { text: '💧 Faucet', callback_data: 'faucet' }
      ],
      [
        { text: '🛒 Buy HEDGY', callback_data: 'buy' },
        { text: '💸 Sell HEDGY', callback_data: 'sell' }
      ],
      [
        { text: '� Send', callback_data: 'send' },
        { text: '�👛 My Wallet', callback_data: 'wallet' }
      ],
      [
        { text: '🌊 Get HBAR', callback_data: 'hbar_faucet' },
        { text: '🔑 Export Key', callback_data: 'export_key' }
      ],
      [
        { text: 'ℹ️ Help', callback_data: 'help' }
      ]
    ]
  }
};

const buyAmounts = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '0.1 HBAR', callback_data: 'buy_0.1' },
        { text: '0.5 HBAR', callback_data: 'buy_0.5' },
        { text: '1 HBAR', callback_data: 'buy_1' }
      ],
      [
        { text: '5 HBAR', callback_data: 'buy_5' },
        { text: '10 HBAR', callback_data: 'buy_10' }
      ],
      [
        { text: '🔙 Back to Menu', callback_data: 'menu' }
      ]
    ]
  }
};

const sellAmounts = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '10 HEDGY', callback_data: 'sell_10' },
        { text: '50 HEDGY', callback_data: 'sell_50' },
        { text: '100 HEDGY', callback_data: 'sell_100' }
      ],
      [
        { text: '500 HEDGY', callback_data: 'sell_500' },
        { text: '1000 HEDGY', callback_data: 'sell_1000' }
      ],
      [
        { text: '🔙 Back to Menu', callback_data: 'menu' }
      ]
    ]
  }
};

const backToMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🔙 Back to Menu', callback_data: 'menu' }]
    ]
  }
};

const confirmExport = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '✅ Yes, Export', callback_data: 'confirm_export' },
        { text: '❌ Cancel', callback_data: 'menu' }
      ]
    ]
  }
};

module.exports = {
  mainMenu,
  buyAmounts,
  sellAmounts,
  backToMenu,
  confirmExport
};
