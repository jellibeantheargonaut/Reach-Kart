const chainApi = require('./rk-src/rk-chain-api');
const { v4: uuid } = require('uuid');
const { ethers } = require('hardhat');

const provider = await new ethers.providers.JsonRpcProvider('http://localhost:8545');
const signer = await provider.getSigner();

await chainApi.deployProductContract(signer.address, 'Iliad','Homer Epic','4000',8);