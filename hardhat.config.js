require("@nomicfoundation/hardhat-toolbox");
const { ethers } = require("ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 6969,
      accounts: [
        {
          // A single account as a reserve for the network 
          privateKey: ethers.Wallet.createRandom().privateKey,
          balance: ethers.parseEther("10000000000").toString()
        }
      ],
      loggingEnabled: true
    }
  }
};
