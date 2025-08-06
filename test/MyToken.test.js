const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let myToken;
  let owner;
  let addr1;
  let addr2;

  const TOKEN_NAME = "MyToken";
  const TOKEN_SYMBOL = "MTK";
  const INITIAL_SUPPLY = 1000000;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy(TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY, owner.address);
    await myToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await myToken.name()).to.equal(TOKEN_NAME);
      expect(await myToken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should set the right owner", async function () {
      expect(await myToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await myToken.balanceOf(owner.address);
      expect(await myToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have 18 decimals", async function () {
      expect(await myToken.decimals()).to.equal(18);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      await myToken.transfer(addr1.address, 50);
      const addr1Balance = await myToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      await myToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await myToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await myToken.balanceOf(owner.address);

      await expect(
        myToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWithCustomError(myToken, "ERC20InsufficientBalance");

      expect(await myToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await myToken.balanceOf(owner.address);

      await myToken.transfer(addr1.address, 100);
      await myToken.transfer(addr2.address, 50);

      const finalOwnerBalance = await myToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - BigInt(150));

      const addr1Balance = await myToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await myToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const initialSupply = await myToken.totalSupply();
      await myToken.mint(addr1.address, 1000);
      
      expect(await myToken.totalSupply()).to.equal(initialSupply + BigInt(1000));
      expect(await myToken.balanceOf(addr1.address)).to.equal(1000);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      await expect(
        myToken.connect(addr1).mint(addr1.address, 1000)
      ).to.be.revertedWithCustomError(myToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their own tokens", async function () {
      await myToken.transfer(addr1.address, 1000);
      const initialBalance = await myToken.balanceOf(addr1.address);
      const initialSupply = await myToken.totalSupply();

      await myToken.connect(addr1).burn(500);

      expect(await myToken.balanceOf(addr1.address)).to.equal(initialBalance - BigInt(500));
      expect(await myToken.totalSupply()).to.equal(initialSupply - BigInt(500));
    });

    it("Should allow burning tokens from another account with allowance", async function () {
      await myToken.transfer(addr1.address, 1000);
      await myToken.connect(addr1).approve(addr2.address, 500);
      
      const initialBalance = await myToken.balanceOf(addr1.address);
      const initialSupply = await myToken.totalSupply();

      await myToken.connect(addr2).burnFrom(addr1.address, 500);

      expect(await myToken.balanceOf(addr1.address)).to.equal(initialBalance - BigInt(500));
      expect(await myToken.totalSupply()).to.equal(initialSupply - BigInt(500));
    });
  });
});