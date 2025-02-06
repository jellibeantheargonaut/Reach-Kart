require("@nomicfoundation/hardhat-toolbox");
const { ethers } = require("ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: Array(50).fill().map(() => ({
        privateKey: ethers.Wallet.createRandom().privateKey,
        balance: ethers.parseEther("10000").toString()
      }))
    }
  }
};
