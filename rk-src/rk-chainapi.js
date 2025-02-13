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
// transactionId - the id of the transaction ( from the buyer to the seller)
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
const { v4: uuid } = require('uuid');
const crypto = require('crypto');
const path = require('path');
const { eth } = require('web3');

db = new sqlite3.Database(path.join(__dirname, 'data', 'reachkart.db'), (err) => {
    if(err){
        console.error(err.message);
    }
    console.log('✅ Connected to the rk database');
});

const provider = new ethers.JsonRpcProvider('http://localhost:8545');
console.log('✅ Connected to the hardhat network');

// function to create database and tables
function createDatabases(){
    // create the orders table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        orderId string PRIMARY KEY,
        orderAddress string NOT NULL,
        productId string NOT NULL,
        buyerAddress string NOT NULL,
        transactionId string,
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

// function to create a new wallet
async function createWallet(email){
    const wallet = ethers.Wallet.createRandom().connect(provider);
    const wid = wallet.address;
    const pk = wallet.privateKey;
    db.run(`INSERT INTO wallets(wid,pk,email) VALUES(?,?,?)`,[wid,pk,email], (err) => {
        if(err){
            console.error(err.message);
        }
        console.log(`✅ Wallet ${wid} created for user ${email}`);
    });
    console.log(`✅ Wallet ${wid} connected to hardhat network`);
}

// function to get the balance of a wallet
async function getWalletBalance(wid){
    const balance = await provider.getBalance(wid);
    console.log(`💰 Balance of wallet ${wid} is ${ethers.formatEther(balance)}`);
    return ethers.formatEther(balance);
}

// function to get the private key of a wallet
async function getWalletPrivateKey(wid){
    return new Promise((resolve,reject) => {
        db.get(`SELECT pk FROM wallets WHERE wid = ?`,[wid], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.pk);
        });
    });
}

// function to fund a wallet
async function fundWallet(wid,amount){
    const reserve = await provider.getSigner(0);
    const tx = await reserve.sendTransaction({
        to: wid,
        value: ethers.parseEther(amount)
    });
    await tx.wait();
    console.log(`💰 Wallet ${wid} funded with ${amount} ETH`);
}

// function to send a transaction
async function transferFunds(buyerWid, sellerWid, amount){
    const buyer = await new ethers.Wallet(await getWalletPrivateKey(buyerWid),provider);
    const tx = await buyer.sendTransaction({
        to: sellerWid,
        value: ethers.parseEther(amount.toString())
    });
    await tx.wait();
    console.log(`💰 ${amount} ETH transferred from ${buyerWid} to ${sellerWid}`);
}


//==================================================================================
// Product Smart contract APIs (these are for the seller)
//==================================================================================

// deploy the product contract
async function deployProductContract(sellerAddress, productName, productDescription, productPrice, productQuantity)
{
    // get pkey of the seller
    const sellerPkey = await getWalletPrivateKey(sellerAddress);
    // get the walet of the seller
    const seller = await new ethers.Wallet(sellerPkey,provider);
    // deploy the product contract
    const Product = await ethers.getContractFactory('ProductRegistry',seller);
    const productId = uuid();
    const etherPrice = ethers.parseEther(productPrice);
    console.log(`✅ Product ${productId} created by seller ${sellerAddress}`);
    const productContract = await Product.deploy(sellerAddress,productId,productName,productDescription,etherPrice,productQuantity);
    console.log(`✅ Product contract deployed at ${productContract.address}`);

    // insert the product into the products table
    db.run(`INSERT INTO products(productId,productAddress,dateAdded) VALUES(?,?,?)`,[productId,await productContract.getAddress(),Date.now()], (err) => {
        if(err){
            console.error(err.message);
        }
        console.log(`✅ Product ${productId} entered in database table`);
    });
}

// function to set the price of the product
async function setProductPrice(productId,productPrice){
    db.get(`SELECT productAddress FROM products WHERE productId = ?`,[productId], async (err,row) => {
        if(err){
            console.error(err.message);
        }
        const productAddress = row.productAddress;
        const productContract = await ethers.getContractAt('ProductRegistry',productAddress,provider);
        const etherPrice = ethers.parseEther(productPrice);
        await productContract.setProductPrice(etherPrice);
        console.log(`✅ Product ${productId} price set to ${productPrice}`);
    });

    // update the dateUpdated field in the products table
    db.run(`UPDATE products SET dateUpdated = ? WHERE productId = ?`,[Date.now(),productId], (err) => {
        if(err){
            console.error(err.message);
        }
        console.log(`✅ Product ${productId} updated in database table`);
    });
}
// function to set the quantity of the product
async function setProductQuantity(productId,productQuantity){
    db.get(`SELECT productAddress FROM products WHERE productId = ?`,[productId], async (err,row) => {
        if(err){
            console.error(err.message);
        }
        const productAddress = row.productAddress;
        const productContract = await ethers.getContractAt('ProductRegistry',productAddress,provider);
        await productContract.setProductQuantity(productQuantity);
        console.log(`✅ Product ${productId} quantity set to ${productQuantity}`);
    });

    // update the dateUpdated field in the products table
    db.run(`UPDATE products SET dateUpdated = ? WHERE productId = ?`,[Date.now(),productId], (err) => {
        if(err){
            console.error(err.message);
        }
        console.log(`✅ Product ${productId} updated in database table`);
    });
}

// function to get the price of the product
async function getProductPrice(productId){
    db.get(`SELECT productAddress FROM products WHERE productId = ?`,[productId], async (err,row) => {
        if(err){
            console.error(err.message);
        }
        const productAddress = row.productAddress;
        const productContract = await ethers.getContractAt('ProductRegistry',productAddress,provider);
        const productPrice = await productContract.getProductPrice();
        console.log(`💰 Price of product ${productId} is ${productPrice}`);
        return ethers.formatEther(productPrice);
    });
}
// function to get the quantity of the product
async function getProductQuantity(productId){
    db.get(`SELECT productAddress FROM products WHERE productId = ?`,[productId], async (err,row) => {
        if(err){
            console.error(err.message);
        }
        const productAddress = row.productAddress;
        const productContract = await ethers.getContractAt('ProductRegistry',productAddress,provider);
        const productQuantity = await productContract.getProductQuantity();
        console.log(`📦 Quantity of product ${productId} is ${productQuantity}`);
        return productQuantity;
    });
}
// function to get the address of the product contract
async function getProductAddress(productId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT productAddress FROM products WHERE productId = ?`,[productId], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.productAddress);
        });
    });
}
// function to get the date when the product was added
async function getProductDateAdded(productId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT dateAdded FROM products WHERE productId = ?`,[productId], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.dateAdded);
        });
    });
}
// function to get the date when the product was updated
async function getProductDateUpdated(productId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT dateUpdated FROM products WHERE productId = ?`,[productId], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.dateUpdated);
        });
    });
}
// function to get the seller of the product

//==================================================================================
// Order Smart contract APIs
//==================================================================================

// deploy the order contract
async function deployOrderContract(buyerAddress, sellerAddress, productId, productQuantity){

    // get product contract address from products table
    db.get(`SELECT productAddress FROM products WHERE productId = ?`,[productId], async (err,row) => {
        if(err){
            console.error(err.message);
        }
        const productAddress = row.productAddress;
        const productContract = await ethers.getContractAt('ProductRegistry',productAddress,provider);
        const productPrice = await productContract.getProductPrice();
        // calculate the total price
        let totalPrice = BigInt(productPrice) * BigInt(productQuantity);
        console.log(`💰 Total price of order for product ${productId} is ${ethers.formatEther(totalPrice)}`);

        // deploy the order contract
        // get buyer pkey
        const buyerPkey = await getWalletPrivateKey(buyerAddress);
        // get the walet of the buyer
        const buyer = await new ethers.Wallet(buyerPkey,provider);
        const Order = await ethers.getContractFactory('Order',buyer);
        const orderId = uuid();
        const orderContract = await Order.deploy(Date.now(),sellerAddress,buyerAddress,orderId,totalPrice);
        console.log(`✅ Order contract deployed at ${orderContract.address}`);

        // insert the order into the orders table
        db.run(`INSERT INTO orders(orderId,orderAddress,productId,buyerAddress,orderPlaced) VALUES(?,?,?,?,?)`,[orderId,await orderContract.getAddress(),productId,buyerAddress,Date.now()], (err) => {
            if(err){
                console.error(err.message);
            }
            console.log(`✅ Order ${orderId} entered in database table for ${productId}`);
        });
    });
}
// function to confirm the order
async function confirmOrder(orderId){
    // update the orderConfirmed field in the orders table
    db.run(`UPDATE orders SET orderConfirmed = ? WHERE orderId = ?`,[Date.now(),orderId], (err) => {
        if(err){
            console.error(err.message);
        }
        console.log(`✅ Order ${orderId} confirmed at ${new Date(Date.now()).toISOString()}`);
    });
}
// function to cancel the order
async function cancelOrder(orderId){
    // update the orderCancelled field in the orders table
    db.run(`UPDATE orders SET orderCancelled = ? WHERE orderId = ?`,[Date.now(),orderId], (err) => {
        if(err){
            console.error(err.message);
        }
        console.log(`✅ Order ${orderId} cancelled at ${new Date(Date.now()).toISOString()}`);
    });
}
// function to pay for the order
async function payOrder(orderId){
    // get the order smart contract address
    db.get(`SELECT orderAddress FROM orders WHERE orderId = ?`,[orderId], async (err,row) => {
        if(err){
            console.error(err.message);
        }
        const orderAddress = row.orderAddress;
        const orderContract = await ethers.getContractAt('Order',orderAddress,provider);
        const orderPrice = await orderContract.getOrderAmount();
        // get the buyer wallet address
        const buyerWid = await orderContract.getOrderBuyer();
        console.log(`📦 Buyer: ${buyerWid}`)
        // get the seller wallet address
        const sellerWid = await orderContract.getOrderSeller();
        console.log(`📦 Seller: ${sellerWid}`);

        // transfer the funds from buyer to seller
        let tx = await transferFunds(buyerWid,sellerWid,orderPrice);
        await tx.wait();
        // update the transactionId field in the orders table
        db.run(`UPDATE orders SET transactionId = ? WHERE orderId = ?`,[tx.hash,orderId], (err) => {
            if(err){
                console.error(err.message);
            }
            console.log(`✅ Order ${orderId} transactionId updated to ${tx.hash}`);
        });
    });
    // update the orderPaid field in the orders table
    db.run(`UPDATE orders SET orderPaid = ? WHERE orderId = ?`,[Date.now(),orderId], (err) => {
        if(err){
            console.error(err.message);
        }
        console.log(`✅ Order ${orderId} paid at ${new Date(Date.now()).toISOString()}`);
    });
}
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
    fundWallet,

    deployProductContract,
    setProductPrice,
    setProductQuantity,
    getProductPrice,
    getProductAddress,
    getProductDateAdded,
    getProductDateUpdated,


    deployOrderContract,
    confirmOrder,
    cancelOrder,
    payOrder
};