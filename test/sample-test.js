const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestERC20", function () {
  it("Should return the correct name and symbol", async function () {
    const TestERC20 = await hre.ethers.getContractFactory("TestERC20");
    const testERC20 = await TestERC20.deploy("testERC20","TERC");
  
    await testERC20.deployed();

    expect(await testERC20.name()).to.equal("testERC20");

    expect(await testERC20.symbol()).to.equal("TERC");
  });
});
