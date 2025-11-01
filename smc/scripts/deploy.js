const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting deployment to Hedera Testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "HBAR\n");

  // Token Configuration
  // const TOKEN_NAME = process.env.TOKEN_NAME || "HedgyToken";
  // const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL || "HEDGY";
  // const INITIAL_SUPPLY = process.env.INITIAL_SUPPLY || hre.ethers.parseEther("1000000");

  // Faucet Configuration
  // const FAUCET_DRIP_AMOUNT = process.env.FAUCET_DRIP_AMOUNT || hre.ethers.parseEther("100");
  // const FAUCET_COOLDOWN_TIME = process.env.FAUCET_COOLDOWN_TIME || 86400; // 24 hours

  // Buy Configuration
  const BUY_TOKEN_PRICE = process.env.BUY_TOKEN_PRICE || hre.ethers.parseEther("0.001");
  const BUY_MIN_PURCHASE = process.env.BUY_MIN_PURCHASE || hre.ethers.parseEther("1");
  const BUY_MAX_PURCHASE = process.env.BUY_MAX_PURCHASE || hre.ethers.parseEther("10000");

  // Use existing token address from previous deployment
  const tokenAddress = "0xaD1C4E8FeA4baf773507F3F2Ed4760B5CF600d12";

  // Sell Configuration
  // const SELL_TOKEN_PRICE = process.env.SELL_TOKEN_PRICE || hre.ethers.parseEther("0.0009");
  // const SELL_MIN_SELL = process.env.SELL_MIN_SELL || hre.ethers.parseEther("1");
  // const SELL_MAX_SELL = process.env.SELL_MAX_SELL || hre.ethers.parseEther("10000");

  // // Deploy Token
  // console.log("📄 Deploying HedgyToken...");
  // const Token = await hre.ethers.getContractFactory("HedgyToken");
  // const token = await Token.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY);
  // await token.waitForDeployment();
  // const tokenAddress = await token.getAddress();
  // console.log("✅ HedgyToken deployed to:", tokenAddress, "\n");

  // // Deploy Faucet
  // console.log("🚰 Deploying TokenFaucet...");
  // const Faucet = await hre.ethers.getContractFactory("TokenFaucet");
  // const faucet = await Faucet.deploy(
  //   tokenAddress,
  //   FAUCET_DRIP_AMOUNT,
  //   FAUCET_COOLDOWN_TIME
  // );
  // await faucet.waitForDeployment();
  // const faucetAddress = await faucet.getAddress();
  // console.log("✅ TokenFaucet deployed to:", faucetAddress, "\n");

  // Deploy Buy Contract
  console.log("💵 Deploying TokenBuy...");
  const Buy = await hre.ethers.getContractFactory("TokenBuy");
  const buy = await Buy.deploy(
    tokenAddress,
    BUY_TOKEN_PRICE,
    BUY_MIN_PURCHASE,
    BUY_MAX_PURCHASE
  );
  await buy.waitForDeployment();
  const buyAddress = await buy.getAddress();
  console.log("✅ TokenBuy deployed to:", buyAddress, "\n");

  // Deploy Sell Contract
  // console.log("💸 Deploying TokenSell...");
  // const Sell = await hre.ethers.getContractFactory("TokenSell");
  // const sell = await Sell.deploy(
  //   tokenAddress,
  //   SELL_TOKEN_PRICE,
  //   SELL_MIN_SELL,
  //   SELL_MAX_SELL
  // );
  // await sell.waitForDeployment();
  // const sellAddress = await sell.getAddress();
  // console.log("✅ TokenSell deployed to:", sellAddress, "\n");

  // // Fund contracts with tokens
  // console.log("💰 Funding contracts with tokens...");
  
  // const faucetFunding = hre.ethers.parseEther("100000");
  // const buyFunding = hre.ethers.parseEther("500000");
  
  // console.log("  → Transferring tokens to Faucet...");
  // await token.transfer(faucetAddress, faucetFunding);
  
  // console.log("  → Approving and funding Buy contract...");
  // await token.approve(buyAddress, buyFunding);
  // await buy.fundContract(buyFunding);
  
  // console.log("✅ Contracts funded successfully\n");

  // Summary
  console.log("=" .repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("  • Token (HEDGY):", tokenAddress);
  console.log("  • Buy Contract:", buyAddress);
  console.log("\n🔗 View on HashScan:");
  console.log(`  https://hashscan.io/testnet/contract/${buyAddress}`);
  console.log("\n💾 Save these addresses to .env or deployments.json");
  console.log("=" .repeat(60));

  // Save deployment addresses
  const fs = require("fs");
  const deployments = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      token: tokenAddress,
      buy: buyAddress,
    },
    config: {
      buyTokenPrice: BUY_TOKEN_PRICE.toString(),
      buyMinAmount: BUY_MIN_PURCHASE.toString(),
      buyMaxAmount: BUY_MAX_PURCHASE.toString(),
    },
  };

  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deployments, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployments.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
