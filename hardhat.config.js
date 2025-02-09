require("@nomicfoundation/hardhat-toolbox");
const { ethers } = require("ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 6969,
      accounts: Array(10).fill().map(() => ({
        privateKey: ethers.Wallet.createRandom().privateKey,
        balance: ethers.parseEther("1000").toString()
      }))
    }
  }
};
