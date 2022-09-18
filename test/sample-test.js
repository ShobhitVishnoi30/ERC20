const { expect } = require("chai");
const { ethers } = require("hardhat");

let user1, user2, user3;

async function getSigners() {
  const accounts = await hre.ethers.getSigners();
  user1 = accounts[0];
  user2 = accounts[1];
  user3 = accounts[2];
}
async function Testing() {
  const TestERC20 = await hre.ethers.getContractFactory("TestERC20");
  const testERC20 = await TestERC20.deploy("testERC20", "TERC");
  await testERC20.deployed();
  describe("TestERC20", async function () {
    it("Should return the correct name and symbol", async function () {
      expect(await testERC20.name()).to.equal("testERC20");

      expect(await testERC20.symbol()).to.equal("TERC");
    });

    it("only owner can mint tokens", async function () {
      await expect(await testERC20.owner()).to.equal(user1.address);

      await expect(
        testERC20.connect(user2).mint(user2.address, 100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("owner can mint tokens", async function () {
      await expect(await testERC20.owner()).to.equal(user1.address);

      expect(await testERC20.balanceOf(user1.address)).to.equal("0");

      await testERC20.connect(user1).mint(user1.address, 1000000000000);

      expect((await testERC20.balanceOf(user1.address)).toString()).to.equal(
        "1000000000000"
      );
    });

    it("user can transfer tokens", async function () {
      expect((await testERC20.balanceOf(user1.address)).toString()).to.equal(
        "1000000000000"
      );
      expect(await testERC20.balanceOf(user2.address)).to.equal("0");

      await testERC20.connect(user1).transfer(user2.address, 100);

      expect((await testERC20.balanceOf(user1.address)).toString()).to.equal(
        "999999999900"
      );
      expect(await testERC20.balanceOf(user2.address)).to.equal("100");
    });

    it("user can not transfer tokens more than balance", async function () {
      expect((await testERC20.balanceOf(user1.address)).toString()).to.equal(
        "999999999900"
      );

      await expect(
        testERC20.connect(user1).transfer(user2.address, 999999999901)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("user should be able to approve users to transfer token", async function () {
      expect(await testERC20.allowance(user1.address, user2.address)).to.equal(
        "0"
      );

      await testERC20.connect(user1).approve(user2.address, 100);

      expect(await testERC20.allowance(user1.address, user2.address)).to.equal(
        "100"
      );
    });

    it("user should be able to transfer tokens on the behalf of the token owner who has approved user", async function () {
      expect(await testERC20.balanceOf(user3.address)).to.equal("0");

      expect(await testERC20.balanceOf(user1.address)).to.equal("999999999900");
      await testERC20
        .connect(user2)
        .transferFrom(user1.address, user3.address, 50);

      expect(await testERC20.balanceOf(user1.address)).to.equal("999999999850");

      expect(await testERC20.balanceOf(user3.address)).to.equal("50");
    });

    it("user should not be able to transfer more tokens than allowed", async function () {
      expect(await testERC20.allowance(user1.address, user2.address)).to.equal(
        "50"
      );
      await expect(
        testERC20.connect(user2).transferFrom(user1.address, user3.address, 51)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("user should be able to burn tokens", async function () {
      expect(await testERC20.balanceOf(user1.address)).to.equal("999999999850");
      await testERC20.connect(user1).burn(100);

      expect(await testERC20.balanceOf(user1.address)).to.equal("999999999750");
    });
  });
}

describe("Setup & Test Contracts", async function () {
  it("Setting up the contracts & Testing", async function () {
    await getSigners();
    await Testing();
  }).timedOut("200000s");
});
