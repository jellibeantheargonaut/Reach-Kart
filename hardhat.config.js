require("@nomicfoundation/hardhat-toolbox");
const { utils, Wallet } = require("ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {},
    reachkart: {
      url: "http://localhost:8545",
      chainId: 2032
    }
  }
};
