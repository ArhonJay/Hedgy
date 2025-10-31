const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './data/users.json';

class Database {
  constructor() {
    this.ensureDataDir();
    this.data = this.load();
  }

  ensureDataDir() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading database:', error);
    }
    return { users: {} };
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  getUser(telegramId) {
    return this.data.users[telegramId] || null;
  }

  createUser(telegramId, walletAddress, privateKey, username = null) {
    this.data.users[telegramId] = {
      telegramId,
      username,
      walletAddress,
      privateKey, // In production, encrypt this!
      createdAt: new Date().toISOString(),
      lastFaucetClaim: null
    };
    this.save();
    return this.data.users[telegramId];
  }

  updateLastFaucetClaim(telegramId) {
    if (this.data.users[telegramId]) {
      this.data.users[telegramId].lastFaucetClaim = new Date().toISOString();
      this.save();
    }
  }

  canUseFaucet(telegramId, cooldownSeconds) {
    const user = this.getUser(telegramId);
    if (!user || !user.lastFaucetClaim) return true;
    
    const lastClaim = new Date(user.lastFaucetClaim);
    const now = new Date();
    const timeDiff = (now - lastClaim) / 1000; // seconds
    
    return timeDiff >= cooldownSeconds;
  }

  getTimeUntilNextFaucet(telegramId, cooldownSeconds) {
    const user = this.getUser(telegramId);
    if (!user || !user.lastFaucetClaim) return 0;
    
    const lastClaim = new Date(user.lastFaucetClaim);
    const now = new Date();
    const timeDiff = (now - lastClaim) / 1000; // seconds
    
    return Math.max(0, cooldownSeconds - timeDiff);
  }
}

module.exports = new Database();
