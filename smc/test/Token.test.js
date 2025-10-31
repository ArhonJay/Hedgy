const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HedgyToken", function () {
  let token;
  let owner;
  let addr1;
  let addr2;

  const TOKEN_NAME = "HedgyToken";
  const TOKEN_SYMBOL = "HEDGY";
  const INITIAL_SUPPLY = ethers.parseEther("1000000");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("HedgyToken");
    token = await Token.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY);
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await token.name()).to.equal(TOKEN_NAME);
      expect(await token.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.parseEther("100");
      await token.transfer(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);

      await token.connect(addr1).transfer(addr2.address, amount);
      expect(await token.balanceOf(addr2.address)).to.equal(amount);
      expect(await token.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialBalance = await token.balanceOf(owner.address);
      const amount = ethers.parseEther("1");

      await expect(
        token.connect(addr1).transfer(owner.address, amount)
      ).to.be.reverted;

      expect(await token.balanceOf(owner.address)).to.equal(initialBalance);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const amount = ethers.parseEther("1000");
      await token.mint(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
    });

    it("Should not allow non-owner to mint", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        token.connect(addr1).mint(addr2.address, amount)
      ).to.be.reverted;
    });

    it("Should not exceed max supply", async function () {
      const maxSupply = await token.MAX_SUPPLY();
      const currentSupply = await token.totalSupply();
      const excessAmount = maxSupply - currentSupply + ethers.parseEther("1");

      await expect(token.mint(addr1.address, excessAmount)).to.be.revertedWith(
        "Exceeds max supply"
      );
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their tokens", async function () {
      const amount = ethers.parseEther("100");
      await token.transfer(addr1.address, amount);

      await token.connect(addr1).burn(amount);
      expect(await token.balanceOf(addr1.address)).to.equal(0);
    });
  });

  describe("Pause", function () {
    it("Should allow owner to pause and unpause", async function () {
      await token.pause();
      expect(await token.paused()).to.equal(true);

      await token.unpause();
      expect(await token.paused()).to.equal(false);
    });

    it("Should prevent transfers when paused", async function () {
      await token.pause();
      const amount = ethers.parseEther("100");

      await expect(token.transfer(addr1.address, amount)).to.be.reverted;
    });
  });

  describe("Blacklist", function () {
    it("Should allow owner to blacklist addresses", async function () {
      await token.blacklist(addr1.address);
      expect(await token.blacklisted(addr1.address)).to.equal(true);
    });

    it("Should prevent blacklisted addresses from receiving tokens", async function () {
      await token.blacklist(addr1.address);
      const amount = ethers.parseEther("100");

      await expect(
        token.transfer(addr1.address, amount)
      ).to.be.revertedWith("Recipient is blacklisted");
    });

    it("Should prevent blacklisted addresses from sending tokens", async function () {
      const amount = ethers.parseEther("100");
      await token.transfer(addr1.address, amount);
      await token.blacklist(addr1.address);

      await expect(
        token.connect(addr1).transfer(addr2.address, amount)
      ).to.be.revertedWith("Sender is blacklisted");
    });
  });
});
