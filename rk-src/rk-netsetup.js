// java script file to set up the hardhat network
// and deploy the smart contracts
// @author: JellibeanTheArgonaut

// Importing the required modules
const fs  = require('fs');
const { ethers } = require('hardhat');
const path = require('path');

// setting up the hardhat network

let provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
console.log('✅ Connected to the hardhat network');

// deploy the smart contracts
let OrderContract = await ethers.getContractFactory('Order');
let ProductContract = await ethers.getContractFactory('ProductRegistry');

// connect to the hardhat network
let signer = provider.getSigner();
OrderContract = OrderContract.connect(provider);
ProductContract = ProductContract.connect(provider);
console.log('✅ Connected Contracts to the hardhat network');

// deploy the contracts
async function deployOrderContract(){
    await OrderContract.deploy().then((contract) => {
        console.log(`✅ Order Contract deployed at ${contract.address}`);
        return contract.address;
    });
}

async function deployProductContract(){
    await ProductContract.deploy().then((contract) => {
        console.log(`✅ Product Contract deployed at ${contract.address}`);
        return contract.address;
    });
}

module.exports = {
    deployOrderContract,
    deployProductContract
}