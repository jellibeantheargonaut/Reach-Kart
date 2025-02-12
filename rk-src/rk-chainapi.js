// javascript file that interacts with the hardhat network
// to provide apis for user and seller operations
//
// @author: JellibeanTheArgonaut


// Orders are stored in orders table in the database
//
// schema of the orders table
// orderId - the id of the order UUIDv4
// orderAddress - the address of the order contract
// productId - the id of the product UUIDv4
// buyerAddress - the address of the buyer (wallet address)
// orderPlaced - the time when the order was placed
// orderConfirmed - the time when the order was confirmed
// orderCancelled - the time when the order was cancelled
// orderPaid - the time when the order was paid for
// orderRefunded - the time when the order was refunded


// products are stored in the products table in the database
//
// schema of the products table
// productId - the id of the product UUIDv4
// productAddress - the address of the product contract
// dateAdded - the time when the product was added
// dateUpdated - the time when the product was updated


// Additional wallets are stored in the wallets table in the database
//
// schema of the wallets table
// wid - the wallet id of the user
// pk - the private key of the wallet
// email - the email of the user

// Addresses databases to store the physical addresses of the users
//
// schema of the addresses table
// email - the email of the user
// address - the physical address of the user

// Importing the required modules
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const { ethers } = require('hardhat');
const crypto = require('crypto');
const path = require('path');

db = new sqlite3.Database(path.join(__dirname, 'data', 'reachkart.db'), (err) => {
    if(err){
        console.error(err.message);
    }
    console.log('✅ Connected to the rk database');
    createDatabases();
});

// function to create database and tables
function createDatabases(){
    // create the orders table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        orderId string PRIMARY KEY,
        orderAddress string NOT NULL,
        productId string NOT NULL,
        buyerAddress string NOT NULL,
        orderPlaced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        orderConfirmed TIMESTAMP,
        orderCancelled TIMESTAMP,
        orderPaid TIMESTAMP,
        orderRefunded TIMESTAMP)`
    );
    console.log('✅ Orders table created');

    // create the products table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS products (
        productId string PRIMARY KEY,
        productAddress string NOT NULL,
        dateAdded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        dateUpdated TIMESTAMP)`
    );
    console.log('✅ Products table created');

    // create the wallets table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS wallets (
        wid string PRIMARY KEY,
        pk string NOT NULL,
        email string NOT NULL)`
    );
    console.log('✅ Wallets table created');

    // create the addresses table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS addresses (
        email string PRIMARY KEY,
        address string NOT NULL)`
    );
    console.log('✅ Addresses table created');

    console.log('✅ Database and tables created');
}

// functions to handle wallet operations
//==============================================================================
// function to get wallets of a user
function getWallets(email){
    return new Promise((resolve,reject) => {
        db.all(`SELECT * FROM wallets WHERE email = ?`,[email], (err,rows) => {
            if(err){
                reject(err);
            }
            resolve(rows);
        });
    });
}

// function to get the wallet id of a user
function getWalletId(email){
    return new Promise((resolve,reject) => {
        db.get(`SELECT wid FROM users WHERE email = ?`,[email], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.wid);
        });
    });
}

// function to create a new wallet
async function createWallet(email){
    const wallet = ethers.Wallet.createRandom();
    const wid = wallet.address;
    const pk = wallet.privateKey;
    db.run(`INSERT INTO wallets(wid,pk,email) VALUES(?,?,?)`,[wid,pk,email], (err) => {
        if(err){
            console.error(err.message);
        }
        console.log(`✅ Wallet ${wid} created for user ${email}`);
    });
    // connect the wallet to the hardhat network
    const provider = await new ethers.JsonRpcProvider('http://localhost:8545');
    await wallet.connect(provider);
    console.log(`✅ Wallet ${wid} connected to hardhat network`);
}

// function to get the balance of a wallet
async function getWalletBalance(wid){
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const balance = await provider.getBalance(wid);
    console.log(`💰 Balance of wallet ${wid} is ${ethers.formatEther(balance)}`);
    return ethers.formatEther(balance);
}

// function to fund a wallet
async function fundWallet(wid,amount){
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const reserve = await provider.getSigner(0);
    const tx = await reserve.sendTransaction({
        to: wid,
        value: ethers.parseEther(amount)
    });
    await tx.wait();
    console.log(`💰 Wallet ${wid} funded with ${amount} ETH`);
}


//==================================================================================
// Product Smart contract APIs
//==================================================================================

// deploy the product contract
// function to deploy the product contract
// function to set the price of the product
// function to set the quantity of the product
// function to update the price of the product
// function to update the quantity of the product
// function to get the price of the product
// function to get the quantity of the product
// function to get the address of the product contract
// function to get the date when the product was added
// function to get the date when the product was updated
// function to get the seller of the product

//==================================================================================
// Order Smart contract APIs
//==================================================================================

// deploy the order contract
// function to confirm the order
// function to cancel the order
// function to pay for the order
// function to refund the order
// function to get the address of the order contract
// function to get the date when the order was placed
// function to get the date when the order was confirmed
// function to get the date when the order was cancelled
// function to get the date when the order was paid
// function to get the date when the order was refunded
// function to get the buyer of the order
// function to get the seller of the order
// function to get the product of the order
// function to get the quantity of the order
// function to get the price of the order
// function to get the status of the order
// function to get the tracking details of the order
// function to get the invoice of the order



// Module exports
module.exports = {
    getWallets,
    createWallet,
    getWalletBalance,
    fundWallet
};