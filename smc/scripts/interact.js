const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔧 Loading deployment information...\n");

  // Load deployment addresses
  if (!fs.existsSync("./deployments.json")) {
    console.error("❌ deployments.json not found. Please deploy contracts first.");
    process.exit(1);
  }

  const deployments = JSON.parse(fs.readFileSync("./deployments.json", "utf8"));
  const { token, faucet, buy, sell } = deployments.contracts;

  const [signer] = await hre.ethers.getSigners();
  console.log("👤 Using account:", signer.address);

  // Get contract instances
  const Token = await hre.ethers.getContractAt("HedgyToken", token);
  const Faucet = await hre.ethers.getContractAt("TokenFaucet", faucet);
  const Buy = await hre.ethers.getContractAt("TokenBuy", buy);
  const Sell = await hre.ethers.getContractAt("TokenSell", sell);

  console.log("\n📊 Contract Status:");
  console.log("=" .repeat(60));

  // Token Info
  const tokenName = await Token.name();
  const tokenSymbol = await Token.symbol();
  const totalSupply = await Token.totalSupply();
  const ownerBalance = await Token.balanceOf(signer.address);
  
  console.log("\n🪙 Token Information:");
  console.log(`  Name: ${tokenName} (${tokenSymbol})`);
  console.log(`  Total Supply: ${hre.ethers.formatEther(totalSupply)} ${tokenSymbol}`);
  console.log(`  Your Balance: ${hre.ethers.formatEther(ownerBalance)} ${tokenSymbol}`);

  // Faucet Info
  const faucetBalance = await Token.balanceOf(faucet);
  const dripAmount = await Faucet.dripAmount();
  const cooldownTime = await Faucet.cooldownTime();
  
  console.log("\n🚰 Faucet Information:");
  console.log(`  Balance: ${hre.ethers.formatEther(faucetBalance)} ${tokenSymbol}`);
  console.log(`  Drip Amount: ${hre.ethers.formatEther(dripAmount)} ${tokenSymbol}`);
  console.log(`  Cooldown: ${cooldownTime.toString()} seconds (${Number(cooldownTime) / 3600} hours)`);

  // Buy Contract Info
  const buyBalance = await Token.balanceOf(buy);
  const buyPrice = await Buy.tokenPrice();
  const minPurchase = await Buy.minPurchase();
  const maxPurchase = await Buy.maxPurchase();
  
  console.log("\n💵 Buy Contract Information:");
  console.log(`  Token Balance: ${hre.ethers.formatEther(buyBalance)} ${tokenSymbol}`);
  console.log(`  Token Price: ${hre.ethers.formatEther(buyPrice)} HBAR`);
  console.log(`  Min Purchase: ${hre.ethers.formatEther(minPurchase)} ${tokenSymbol}`);
  console.log(`  Max Purchase: ${hre.ethers.formatEther(maxPurchase)} ${tokenSymbol}`);

  // Sell Contract Info
  const sellBalance = await Token.balanceOf(sell);
  const sellPrice = await Sell.tokenPrice();
  const minSell = await Sell.minSell();
  const maxSell = await Sell.maxSell();
  
  console.log("\n💸 Sell Contract Information:");
  console.log(`  Token Balance: ${hre.ethers.formatEther(sellBalance)} ${tokenSymbol}`);
  console.log(`  Token Price: ${hre.ethers.formatEther(sellPrice)} HBAR`);
  console.log(`  Min Sell: ${hre.ethers.formatEther(minSell)} ${tokenSymbol}`);
  console.log(`  Max Sell: ${hre.ethers.formatEther(maxSell)} ${tokenSymbol}`);

  console.log("\n" + "=" .repeat(60));
  console.log("\n✨ Available Actions:");
  console.log("  • Request tokens from faucet");
  console.log("  • Buy tokens with HBAR");
  console.log("  • Sell tokens for HBAR");
  console.log("  • Transfer tokens to other addresses");
  console.log("\n💡 Modify this script to perform specific actions\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
