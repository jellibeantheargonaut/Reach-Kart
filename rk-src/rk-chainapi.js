// javascript file that interacts with the hardhat network
// to provide apis for user and seller operations
//
// @author: JellibeanTheArgonaut

// Users are stored in the users table in the database
//
// schema of the users table
// wid - the wallet id of the user
// pk - the private key of the wallet
// email - the email of the user
// password - the password of the user
// name - the name of the user
// created_at - the time when the user was created
// account_type - the type of account (user or seller)

// Orders are stored in orders table in the database
//
// schema of the orders table
// orderId - the id of the order UUIDv4
// orderAddress - the address of the order contract
// productId - the id of the product UUIDv4
// buyerAddress - the address of the buyer (wallet address)
// sellerAddress - the address of the seller (wallet address)
// transactionId - the id of the transaction ( from the buyer to the seller)
// shipmentId - the id of the shipment UUIDv4
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
// sellerMail - the address of the seller
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
// addressId - the id of the address UUIDv4
// addressValue - the address of the user
//
// Shipments are stored in the shipments table in the database
//
// schema of the shipments table
// shipmentId - the id of the shipment UUIDv4
// orderId - the id of the order UUIDv4
// shipmentAddress - the address of the shipment contract
// shippedDate - the time when the shipment was placed
// deliveredDate - the time when the shipment was delivered

// Importing the required modules
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const { ethers } = require('hardhat');
const { v4: uuid } = require('uuid');
const path = require('path');
const { RKWriteLog } = require('./rk-logs');
const { get } = require('http');
const { MeiliSearch } = require('meilisearch');

// setting up sqlite3 database
// create new if not exists
if(!fs.existsSync('./data/reachkart.db')){
    RKWriteLog('[ rk-chainapi ] 📂 Database not found. Creating a new one','rk-chainapi');
    fs.openSync('./data/reachkart.db', 'w');
    RKWriteLog('[ rk-chainapi ] 📂 Database created','rk-chainapi');
}

// sqlite database setup
const db = new sqlite3.Database(path.join(__dirname, 'data', 'reachkart.db'), (err) => {
    if(err){
        console.error(err.message);
    }
    RKWriteLog('[ rk-chainapi ] 📶 Connected to the rk database','rk-chainapi');
});

// meilisearch setup
const meilisearch = new MeiliSearch({
    host: 'http://localhost:7700',
    apiKey: 'SuperSecretPasswordForMeilisearch'
});

// products document structure
// {
//     productId: 'UUIDv4',
//     productName: 'string',
//     productDescription: 'string',
//     productPrice: 'string',
//     productQuantity: 'string',
//     productImage: 'string', // url of the image
//     sellerMail: 'string',
//     dateAdded: 'timestamp',
//     dateUpdated: 'timestamp'
//}

// products index is only for searching purposes
// while most other operations still rely on smart contracts calls

// create an index for products with id as primary key
const productsIndex = meilisearch.index('products', {
    primaryKey: 'productId'
});

const provider = new ethers.JsonRpcProvider('http://localhost:8545');
RKWriteLog('[ rk-chainapi ] 📶 Connected to the hardhat network','rk-chainapi','rk-chainapi');

// function to create database and tables
async function createDatabases(){
    // create the users table if not exists
    await new Promise(resolve => {
        db.run(` CREATE TABLE IF NOT EXISTS users (
            wid string PRIMARY KEY,
            pk string NOT NULL,
            email string NOT NULL,
            password string NOT NULL,
            name string NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            account_type string DEFAULT 'user' NOT NULL)`
        );
        resolve();
    });
    RKWriteLog('[ rk-chainapi ] 👍🏻 Users table created','rk-chainapi');

    // create the orders table if not exists
    await new Promise(resolve => {
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            orderId string PRIMARY KEY,
            orderAddress string NOT NULL,
            productId string NOT NULL,
            buyerAddress string NOT NULL,
            sellerAddress string NOT NULL,
            transactionId string,
            orderPlaced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            orderConfirmed TIMESTAMP,
            orderCancelled TIMESTAMP,
            orderPaid TIMESTAMP,
            orderRefunded TIMESTAMP)`
        );
        resolve();
    });
    RKWriteLog('[ rk-chainapi ] 👍🏻 Orders table created','rk-chainapi');

    // create the products table if not exists
    await new Promise(resolve => {
        db.run(`CREATE TABLE IF NOT EXISTS products (
            productId string PRIMARY KEY,
            productAddress string NOT NULL,
            sellerMail string NOT NULL,
            dateAdded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            dateUpdated TIMESTAMP)`
        );
        resolve();
    });
    RKWriteLog('[ rk-chainapi ] 👍🏻 Products table created','rk-chainapi');

    // create the wallets table if not exists
    await new Promise(resolve => {
        db.run(`CREATE TABLE IF NOT EXISTS wallets (
            wid string PRIMARY KEY,
            pk string NOT NULL,
            email string NOT NULL)`
        );
        resolve();
    });
    RKWriteLog('[ rk-chainapi ] 👍🏻 Wallets table created','rk-chainapi');

    // create the addresses table if not exists
    await new Promise(resolve => {
        db.run(`CREATE TABLE IF NOT EXISTS addresses (
            addressId string PRIMARY KEY,
            email string NOT NULL,
            addressValue string NOT NULL)`
        );
        resolve();
    });
    RKWriteLog('[ rk-chainapi ] 👍🏻 Addresses table created','rk-chainapi');

    // create the shipments table if not exists
    await new Promise(resolve => {
        db.run(`CREATE TABLE IF NOT EXISTS shipments (
            shipmentId string PRIMARY KEY,
            shipmentAddress string NOT NULL,
            orderId string,
            shippedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deliveredDate TIMESTAMP)`
        );
        resolve();
    });
    RKWriteLog('[ rk-chainapi ] 👍🏻 Shipments table created','rk-chainapi');

    RKWriteLog('[ rk-chainapi ] 👍🏻 Database and tables created','rk-chainapi');
}
// function to delete tables in database
function deleteTables(){
    db.run(`DROP TABLE IF EXISTS users`);
    RKWriteLog('🪓 Users table deleted','rk-chainapi');
    db.run(`DROP TABLE IF EXISTS orders`);
    RKWriteLog('🪓 Orders table deleted','rk-chainapi');
    db.run(`DROP TABLE IF EXISTS products`);
    RKWriteLog('🪓 Products table deleted','rk-chainapi');
    db.run(`DROP TABLE IF EXISTS wallets`);
    RKWriteLog('🪓 Wallets table deleted','rk-chainapi');
    db.run(`DROP TABLE IF EXISTS addresses`);
    RKWriteLog('🪓 Addresses table deleted','rk-chainapi');
    db.run(`DROP TABLE IF EXISTS shipments`);
    RKWriteLog('🪓 Shipments table deleted','rk-chainapi');
}

// function to reset the meili search index
async function resetMeiliSearch(){
    await productsIndex.deleteAllDocuments();
    RKWriteLog('[ rk-chainapi ] 🪓 Products index reset','rk-chainapi');
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
    return new Promise((resolve,reject) => {
        const wallet = ethers.Wallet.createRandom().connect(provider);
        const wid = wallet.address;
        const pk = wallet.privateKey;
        db.run(`INSERT INTO wallets(wid,pk,email) VALUES(?,?,?)`,[wid,pk,email], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            RKWriteLog(`[ rk-chainapi ] 💳 Wallet ${wid} created for user ${email}`,'rk-chainapi');
        });
        RKWriteLog(`[ rk-chainapi ] 💳 Wallet ${wid} connected to hardhat network`,'rk-chainapi');
        resolve(wid);
    });
}

// function to delete a wallet
async function deleteWallet(wid){
    return new Promise((resolve,reject) => {
        db.run(`DELETE FROM wallets WHERE wid = ?`,[wid], (err) => {
            if(err){
                RKWriteLog(`[ rk-chainapi ] 🪓 Error deleting wallet`,'rk-error');
                reject(err);
            }
            RKWriteLog(`[ rk-chainapi ] 🪓 Wallet ${wid} deleted`,'rk-chainapi');
        });
        resolve();
    });
}

// function to set the primary wallet of a user
async function setPrimaryWallet(email,wid){
    return new Promise(async (resolve,reject) => {
        db.run(`UPDATE users SET wid = ?, pk = ? WHERE email = ?`,[wid,await getWalletPrivateKey(wid),email], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            RKWriteLog(`[ rk-chainapi ] 💳 Primary wallet set to ${wid} for user ${email}`,'rk-chainapi');
        });
        resolve();
    });
}

// function to get the balance of a wallet
async function getWalletBalance(wid){
    return new Promise(async (resolve,reject) => {
        const balance = await provider.getBalance(wid);
        RKWriteLog(`[ rk-chainapi ] 💵 Balance of wallet ${wid} is ${ethers.formatEther(balance)}`,'rk-chainapi');
        resolve(ethers.formatEther(balance));
    });
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
    return new Promise(async (resolve,reject) => {
        const reserve = await provider.getSigner(0);
        const tx = await reserve.sendTransaction({
            to: wid,
            value: ethers.parseEther(amount)
        });
        await tx.wait();
        RKWriteLog(`[ rk-chainapi ] 🤑 Wallet ${wid} funded with ${amount} ETH`,'rk-chainapi');
        resolve(tx.hash);
    });
}

// function to send a transaction
async function transferFunds(buyerWid, sellerWid, amount){
    return new Promise(async (resolve,reject) => {
        const buyer = await new ethers.Wallet(await getWalletPrivateKey(buyerWid),provider);
        const tx = await buyer.sendTransaction({
            to: sellerWid,
            value: ethers.parseEther(amount.toString())
        });
        await tx.wait();
        RKWriteLog(`[ rk-chainapi ] 💵 ${amount} ETH transferred from ${buyerWid} to ${sellerWid}`,'rk-chainapi');

        // return the transaction hash
        resolve(tx.hash);
    });
}

// function to get the details of a transaction
async function getTransactionDetails(txId){
    return new Promise(async (resolve,reject) => {
        const tx = await provider.getTransaction(txId);
        const block = await provider.getBlock(tx.blockNumber);

        const details = {
            blockNumber: tx.blockNumber,
            from: tx.from,
            to: tx.to,
            value: ethers.formatEther(tx.value),
            gasPrice: ethers.formatEther(tx.gasPrice),
            gasLimit: tx.gasLimit,
            time: block.timestamp,
        };
        resolve(details);
    });
}

function getAddress(addressId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT addressValue FROM addresses WHERE addressId = ?`,[addressId], (err,row) => {
            if(err){
                RKWriteLog(`[ rk-logging ] ❌ Error getting address with id ${addressId}`, 'rk-logging');
                reject(err);
            }
            if(row){
                resolve(row.addressValue);
            }
            resolve(null);
        });
    });
}


//==================================================================================
// Product Smart contract APIs (these are for the seller)
//==================================================================================

// deploy the product contract
async function deployProductContract(sellerMail,sellerAddress, productName, productDescription,productImage, productPrice, productQuantity, productTags)
{

    return new Promise(async (resolve,reject) => {

        // get pkey of the seller
        const sellerPkey = await getWalletPrivateKey(sellerAddress);
        // get the walet of the seller
        const seller = await new ethers.Wallet(sellerPkey,provider);
        // deploy the product contract
        const Product = await ethers.getContractFactory('ProductRegistry',seller);
        const productId = uuid();
        const etherPrice = ethers.parseEther(productPrice);
        RKWriteLog(`[ rk-chainapi ] 📦 Product ${productId} created by seller ${sellerAddress}`,'rk-chainapi');
        const productContract = await Product.deploy(sellerAddress,productId,productName,productDescription,etherPrice,productQuantity);
        RKWriteLog(`[ rk-chainapi ] 📦 Product contract deployed at ${productContract.address}`,'rk-chainapi');

        // insert the product into the products table
        db.run(`INSERT INTO products(productId,productAddress,sellerMail,dateAdded) VALUES(?,?,?,?)`,[productId,await productContract.getAddress(),sellerMail,Date.now()], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            RKWriteLog(`[ rk-chainapi ] 📦 Product ${productId} entered in database table`,'rk-chainapi');
        });

        // add the product to the products index
        const productDocument = {
            productId: productId,
            productName: productName,
            productDescription: productDescription,
            productImage: productImage ? productImage : '',
            productPrice: productPrice,
            productQuantity: productQuantity,
            sellerMail: sellerMail,
            dateAdded: Date.now(),
            dateUpdated: Date.now(),
            tags: productTags
        };
        await productsIndex.addDocuments([productDocument]);
        RKWriteLog(`[ rk-chainapi ] 📦 Product ${productId} added to products index`,'rk-chainapi');
        resolve(productId);
    });
}

// function to set the price of the product
async function setProductPrice(productId,productPrice){
    return new Promise((resolve,reject) => {
        db.get(`SELECT productAddress FROM products WHERE productId = ?`,[productId], async (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            const productAddress = row.productAddress;
            const productContract = await ethers.getContractAt('ProductRegistry',productAddress,provider);
            const etherPrice = ethers.parseEther(productPrice);
            await productContract.setProductPrice(etherPrice);
            RKWriteLog(`[ rk-chainapi ] 📦 Product ${productId} price set to ${productPrice}`,'rk-chainapi');
        });

        // update the dateUpdated field in the products table
        db.run(`UPDATE products SET dateUpdated = ? WHERE productId = ?`,[Date.now(),productId], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            RKWriteLog(`[ rk-chainapi ] 📦 Product ${productId} updated in database table`,'rk-chainapi');
        });

        // update the product in the products index
        const productDocument = {
            productId: productId,
            productPrice: productPrice,
            dateUpdated: Date.now()
        };
        productsIndex.updateDocuments([productDocument]);
        RKWriteLog(`[ rk-chainapi ] 📦 Product ${productId} updated in products index`,'rk-chainapi');
        resolve();
    });
}
// function to set the quantity of the product
async function setProductQuantity(productId,productQuantity){
    return new Promise((resolve,reject) => {
        db.get(`SELECT productAddress FROM products WHERE productId = ?`,[productId], async (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            const productAddress = row.productAddress;
            const productContract = await ethers.getContractAt('ProductRegistry',productAddress,provider);
            await productContract.setProductQuantity(productQuantity);
            RKWriteLog(`[ rk-chainapi ] 📦 Product ${productId} quantity set to ${productQuantity}`,'rk-chainapi');
        });

        // update the dateUpdated field in the products table
        db.run(`UPDATE products SET dateUpdated = ? WHERE productId = ?`,[Date.now(),productId], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            RKWriteLog(`[ rk-chainapi ] 📦 Product ${productId} updated in database table`,'rk-chainapi');
        });

        // update the product in the products index
        const productDocument = {
            productId: productId,
            productQuantity: productQuantity,
            dateUpdated: Date.now()
        };
        productsIndex.updateDocuments([productDocument]);
        resolve();
    });
}

// function to get the seller address from the product
async function getProductSeller(productId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT productAddress FROM products WHERE productId = ?`,[productId], async (err,row) => {
            if(err){
                RKWriteLog(`[ rk-chainapi ] 📦 Error: ${err}`,'rk-error');
                reject(err);
            }
            const productAddress = row.productAddress;
            const productContract = await ethers.getContractAt('ProductRegistry',productAddress,provider);
            const seller = await productContract.getProductSeller();
            RKWriteLog(`[ rk-chainapi ] 📦 Seller of product ${productId} : ${seller}`,'rk-chainapi');
            resolve(seller);
        });
    });
}

// function to get the price of the product
async function getProductPrice(productId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT productAddress FROM products WHERE productId = ?`,[productId], async (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            const productAddress = row.productAddress;
            const productContract = await ethers.getContractAt('ProductRegistry',productAddress,provider);
            const productPrice = await productContract.getProductPrice();
            RKWriteLog(`[ rk-chainapi ] 💵 Price of product ${productId} is ${productPrice}`,'rk-chainapi');
            resolve(ethers.formatEther(productPrice));
        });
    });
}

// function to get the Image url from the index
async function getProductImage(productId) {
    return new Promise(async (resolve, reject) => {
        try {
            // Search for the product in the Meilisearch index by productId
            const product = await productsIndex.getDocument(productId);

            const productImage = product.productImage || "https://pixsector.com/cache/517d8be6/av5c8336583e291842624.png" 
            RKWriteLog(`[ rk-chainapi ] 🖼️ Image URL of product ${productId}: ${productImage}`, 'rk-chainapi');
            resolve(productImage);
        } catch (err) {
            RKWriteLog(`[ rk-chainapi ] ❌ Error fetching image for product ${productId}: ${err.message}`, 'rk-error');
            reject(err);
        }
    });
}

// function to get the quantity of the product
async function getProductQuantity(productId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT productAddress FROM products WHERE productId = ?`,[productId], async (err,row) => {
            if(err){
                console.error(err.message);
            }
            const productAddress = row.productAddress;
            const productContract = await ethers.getContractAt('ProductRegistry',productAddress,provider);
            const productQuantity = await productContract.getProductQuantity();
            RKWriteLog(`[ rk-chainapi ] 📦 Quantity of product ${productId} is ${productQuantity}`,'rk-chainapi');
            resolve(productQuantity.toString());
        });
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

// function to get the name of the product
async function getProductName(productId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT productAddress FROM products WHERE productId = ?`,[productId], async (err,row) => {
            if(err){
                reject(err);
            }
            const productAddress = row.productAddress;
            const productContract = await ethers.getContractAt('ProductRegistry',productAddress,provider);
            const productName = await productContract.getProductName();
            RKWriteLog(`[ rk-chainapi ] 📦 Name of product ${productId} : ${productName}`,'rk-chainapi');
            resolve(productName);
        });
    });
}

// function to get the description of the product
async function getProductDescription(productId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT productAddress FROM products WHERE productId = ?`,[productId], async (err,row) => {
            if(err){
                reject(err);
            }
            const productAddress = row.productAddress;
            const productContract = await ethers.getContractAt('ProductRegistry',productAddress,provider);
            const productDescription = await productContract.getProductDescription();
            RKWriteLog(`[ rk-chainapi ] 📦 Description of product ${productId} : ${productDescription}`,'rk-chainapi');
            resolve(productDescription);
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
async function deployOrderContract(buyerAddress, sellerAddress, productId, productQuantity, deliveryAddress){

    return new Promise((resolve,reject) => {

        // get product contract address from products table
        db.get(`SELECT productAddress FROM products WHERE productId = ?`,[productId], async (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            const productAddress = row.productAddress;
            const productContract = await ethers.getContractAt('ProductRegistry',productAddress,provider);
            const productPrice = await productContract.getProductPrice();
            // calculate the total price
            let totalPrice = BigInt(productPrice) * BigInt(productQuantity);
            RKWriteLog(`[ rk-chainapi ] 💵 Total price of order for product ${productId} is ${ethers.formatEther(totalPrice)}`,'rk-chainapi');

            // get the delivery address
            const deliveryAddressId = await getAddress(deliveryAddress);
            // deploy the order contract
            // get buyer pkey
            const buyerPkey = await getWalletPrivateKey(buyerAddress);
            // get the walet of the buyer
            const buyer = await new ethers.Wallet(buyerPkey,provider);
            const Order = await ethers.getContractFactory('Order',buyer);
            const orderId = uuid();
            const orderContract = await Order.deploy(Date.now(),sellerAddress,buyerAddress,orderId,totalPrice,productQuantity, deliveryAddressId);

            // send evm_mine rpc call
            await provider.send("evm_mine");
            RKWriteLog(`[ rk-chainapi ] 👍🏻 Order contract deployed at ${orderContract.address}`,'rk-chainapi');

            // insert the order into the orders table
            db.run(`INSERT INTO orders(orderId,orderAddress,productId,buyerAddress,sellerAddress,orderPlaced) VALUES(?,?,?,?,?,?)`,[orderId,await orderContract.getAddress(),productId,buyerAddress,sellerAddress,Date.now()], (err) => {
                if(err){
                    console.error(err.message);
                    reject(err);
                }
                RKWriteLog(`[ rk-chainapi ] 👍🏻 Order ${orderId} entered in database table for ${productId}`,'rk-chainapi');
            });
            resolve(orderId);
        });
    });
}

// function to confirm the order
async function confirmOrder(orderId){
    return new Promise((resolve,reject) => {
        // update the orderConfirmed field in the orders table
        db.run(`UPDATE orders SET orderConfirmed = ? WHERE orderId = ?`,[Date.now(),orderId], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            RKWriteLog(`[ rk-chainapi ] 👍🏻 Order ${orderId} confirmed at ${new Date(Date.now()).toISOString()}`,'rk-chainapi');
        });
        resolve();
    });
}

// function to cancel the order
async function cancelOrder(orderId){
    return new Promise((resolve,reject) => {
        // update the orderCancelled field in the orders table
        db.run(`UPDATE orders SET orderCancelled = ? WHERE orderId = ?`,[Date.now(),orderId], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            RKWriteLog(`[ rk-chainapi ] 👎🏻 Order ${orderId} cancelled at ${new Date(Date.now()).toISOString()}`,'rk-chainapi');
        });
        resolve();
    });
}
// function to pay for the order
async function payOrder(orderId){
    return new Promise((resolve,reject) => {
        // get the order smart contract address
        db.get(`SELECT orderAddress FROM orders WHERE orderId = ?`,[orderId], async (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            const orderAddress = row.orderAddress;
            const orderContract = await ethers.getContractAt('Order',orderAddress,provider);
            const orderPrice = await orderContract.getOrderAmount();
            // get the buyer wallet address
            const buyerWid = await orderContract.getOrderBuyer();
            RKWriteLog(`[ rk-chainapi ] 💳 Buyer: ${buyerWid} for Order : ${orderId}`,'rk-chainapi')
            // get the seller wallet address
            const sellerWid = await orderContract.getOrderSeller();
            RKWriteLog(`[ rk-chainapi ] 💳 Seller: ${sellerWid} for Order : ${orderId}`,'rk-chainapi');

            // transfer the funds from buyer to seller
            let txId = await transferFunds(buyerWid,sellerWid,ethers.formatEther(orderPrice));
            // update the transactionId field in the orders table
            db.run(`UPDATE orders SET transactionId = ? WHERE orderId = ?`,[txId,orderId], (err) => {
                if(err){
                    console.error(err.message);
                    reject(err);
                }
                RKWriteLog(`[ rk-chainapi ] 👍🏻 Order ${orderId} transactionId updated to ${txId}`,'rk-chainapi');
            });
        });
        // update the orderPaid field in the orders table
        db.run(`UPDATE orders SET orderPaid = ? WHERE orderId = ?`,[Date.now(),orderId], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            RKWriteLog(`[ rk-chainapi ] 👍🏻 Order ${orderId} paid at ${new Date(Date.now()).toISOString()}`,'rk-chainapi');
        });
        resolve();
    });
}
// function to refund the order
// function to get the address of the order contract
// function to get the date when the order was placed
async function getOrderPlacedDate(orderId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT orderPlaced FROM orders WHERE orderId = ?`,[orderId], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.orderPlaced);
        });
    });
}

// function to update the buyer of the order
async function updateOrderBuyer(orderId,buyerAddress){
    return new Promise(async (resolve,reject) => {
        const buyerPkey = await getWalletPrivateKey(buyerAddress);
        const buyer = await new ethers.Wallet(buyerPkey,provider);
        // update the buyer address in the order contract
        db.get(`SELECT orderAddress FROM orders WHERE orderId = ?`,[orderId], async (err,row) => {
            if(err){
                RKWriteLog(`[ rk-chainapi ] 📦 Error: updateOrderBuyer`,'rk-error');
                reject(err);
            }
            const orderAddress = row.orderAddress;
            const orderContract = await ethers.getContractAt('Order',orderAddress,buyer);
            let tx = await orderContract.updateBuyer(buyerAddress);
            await tx.wait();
        });
        // update the buyer address in the orders table
        db.run(`UPDATE orders SET buyerAddress = ? WHERE orderId = ?`,[buyerAddress,orderId], (err) => {
            if(err){
                reject(err);
            }
        });
        RKWriteLog(`[ rk-chainapi ] 📦 Buyer of order ${orderId} updated to ${buyerAddress}`,'rk-chainapi');
        resolve();
    });
}

// function to update the seller of the order

// function to get the date when the order was confirmed
async function getOrderConfirmedDate(orderId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT orderConfirmed FROM orders WHERE orderId = ?`,[orderId], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.orderConfirmed);
        });
    });
}

// function to get the date when the order was cancelled
async function getOrderCancelledDate(orderId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT orderCancelled FROM orders WHERE orderId = ?`,[orderId], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.orderCancelled);
        });
    });
}

// function to get the date when the order was paid
async function getOrderPaidDate(orderId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT orderPaid FROM orders WHERE orderId = ?`,[orderId], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.orderPaid);
        });
    });
}

// function to get the date when the order was refunded
async function getOrderRefundedDate(orderId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT orderRefunded FROM orders WHERE orderId = ?`,[orderId], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.orderRefunded);
        });
    });
}

// function to get the buyer of the order
async function getOrderBuyer(orderId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT buyerAddress FROM orders WHERE orderId = ?`,[orderId], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.buyerAddress);
        });
    });
}
// function to get the seller of the order
async function getOrderSeller(orderId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT sellerAddress FROM orders WHERE orderId = ?`,[orderId], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.sellerAddress);
        });
    });
}

// function to get the product of the order
async function getOrderProduct(orderId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT productId FROM orders WHERE orderId = ?`,[orderId], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.productId);
        });
    });
}

// function to get the quantity of the order
async function getOrderQuantity(orderId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT orderAddress FROM orders WHERE orderId = ?`,[orderId], async (err,row) => {
            if(err){
                reject(err);
            }
            
            const orderAddress = row.orderAddress;
            const orderContract = await ethers.getContractAt('Order',orderAddress,provider);
            const orderQuantity = await orderContract.getOrderQuantity();
            resolve(orderQuantity.toString());
        });
    });
}

// function to get the price of the order
async function getOrderPrice(orderId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT orderAddress FROM orders WHERE orderId = ?`, [orderId], async (err,row) => {
            if(err){
                reject(err);
            }
            const orderAddress = row.orderAddress;
            const orderContract = await ethers.getContractAt('Order',orderAddress,provider);
            const orderPrice = await orderContract.getOrderAmount();
            resolve(ethers.formatEther(orderPrice));
        });
    });
}

// function to get the order delivery address
async function getOrderDeliveryAddress(orderId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT orderAddress FROM orders WHERE orderId = ?`,[orderId], async (err,row) => {
            if(err){
                RKWriteLog(`[ rk-chainapi ] 🚚 Error: ${err}`,'rk-error');
                reject(err);
            }
            const orderAddress = row.orderAddress;
            const orderContract = await ethers.getContractAt('Order',orderAddress,provider);
            const deliveryAddress = await orderContract.getOrderDeliveryAddress();
            RKWriteLog(`[ rk-chainapi ] 🚚 Delivery address of order ${orderId} : ${deliveryAddress}`,'rk-chainapi');
            resolve(deliveryAddress);
        });
    });
}

// function to get the transaction details of the order
async function getOrderTransaction(orderId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT transactionId FROM orders WHERE orderId = ?`,[orderId], async (err,row) => {
            if(err){
                reject(err);
            }
            
            const transactionId = row.transactionId;
            const tx = await provider.getTransaction(transactionId);
            const block = await provider.getBlock(tx.blockNumber);

            const details = {
                hash: tx.hash,
                blockNumber: tx.blockNumber,
                from: tx.from,
                to: tx.to,
                value: ethers.formatEther(tx.value),
                gasPrice: ethers.formatEther(tx.gasPrice),
                gasLimit: tx.gasLimit,
                time: new Date(block.timestamp * 1000).toLocaleString('en-US', {
                    month: 'long',      // Full month name (e.g., "January")
                    day: 'numeric',     // Day of the month (e.g., "1")
                    year: 'numeric',    // Full year (e.g., "2023")
                    hour: 'numeric',    // Hour (e.g., "12")
                    minute: 'numeric',  // Minute (e.g., "30")
                    second: 'numeric',  // Second (e.g., "45")
                    hour12: true        // Use 12-hour clock (e.g., "AM/PM")
                  }),
            };
            resolve(details);
        });
    });
}

//==================================================================================
// Shipment Smart contract APIs
//==================================================================================

// deploy the shipment contract
async function deployShipmentContract(buyerMail, sellerMail, orderId, srcId, dstId, sellerWid){
    
    return new Promise(async (resolve,reject) => {
        // generate the shipment id
        const shipmentId = uuid();

        // get the seller wallet address
        const sellerPkey = await getWalletPrivateKey(sellerWid);
        const seller = await new ethers.Wallet(sellerPkey,provider);

        // addressses
        const shipmentSource = await getAddress(srcId);
        const shipmentDestination = await getAddress(dstId);

        // deploy the shipment contract
        const Shipment = await ethers.getContractFactory('Shipment',seller);
        const shipmentContract = await Shipment.deploy(Date.now(),shipmentId,orderId,buyerMail,sellerMail, shipmentSource, shipmentDestination);
        RKWriteLog(`[ rk-chainapi ] 🚚 Shipment contract deployed at ${await shipmentContract.getAddress()}`,'rk-chainapi');

        // insert the shipment into the shipments table
        db.run(`INSERT INTO shipments(shipmentId,shipmentAddress,shippedDate) VALUES(?,?,?)`,[shipmentId,await shipmentContract.getAddress(),Date.now()], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            RKWriteLog(`[ rk-chainapi ] 🚚 Shipment ${shipmentId} entered in database table`,'rk-chainapi');
        });
        resolve();
    });
}

// function to get the destination address of the shipment contract
async function getShipmentDestination(shipmentId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT shipmentAddress FROM shipments WHERE shipmentId = ?`,[shipmentId], async (err,row) => {
            if(err){
                reject(err);
            }
            const shipmentAddress = row.shipmentAddress;
            const shipmentContract = await ethers.getContractAt('Shipment',shipmentAddress,provider);

            // shipmentDestination is the buyer addressId
            const destination = await shipmentContract.getShipmentDestination();
            // get the address of the buyer from the addresses table
            db.get(`SELECT addressValue FROM addresses WHERE addressId = ?`,[destination], (err,row) => {
                if(err){
                    RKWriteLog(`[ rk-chainapi ] 🚚 Error: ${err}`,'rk-error');
                    reject(err);
                }
                RKWriteLog(`[ rk-chainapi ] 🚚 Destination of shipment ${shipmentId} : ${row.addressValue}`,'rk-chainapi');
                resolve(row.addressValue);
            });
        });
    });
}

// function to get the source of the shipment contract
async function getShipmentSource(shipmentId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT shipmentAddress FROM shipments WHERE shipmentId = ?`,[shipmentId], async (err,row) => {
            if(err){
                reject(err);
            }
            const shipmentAddress = row.shipmentAddress;
            const shipmentContract = await ethers.getContractAt('Shipment',shipmentAddress,provider);

            // shipmentSource is the seller addressId
            const source = await shipmentContract.getShipmentSource();
            // get the address of the seller from the addresses table
            db.get(`SELECT addressValue FROM addresses WHERE addressId = ?`,[source], (err,row) => {
                if(err){
                    RKWriteLog(`[ rk-chainapi ] 🚚 Error: ${err}`,'rk-error');
                    reject(err);
                }
                RKWriteLog(`[ rk-chainapi ] 🚚 Source of shipment ${shipmentId} : ${row.addressValue}`,'rk-chainapi');
                resolve(row.addressValue);
            });
        });
    });
}

// function to get the date when the shipment was placed
async function getShipmentShippedDate(shipmentId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT shippedDate FROM shipments WHERE shipmentId = ?`,[shipmentId], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.shippedDate);
        });
    });
}

// function to get the date when the shipment was delivered
async function getShipmentDeliveredDate(shipmentId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT deliveredDate FROM shipments WHERE shipmentId = ?`,[shipmentId], (err,row) => {
            if(err){
                reject(err);
            }
            resolve(row.deliveredDate);
        });
    });
}

// function to get shipment buyer
async function getShipmentBuyer(shipmentId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT shipmentAddress FROM shipments WHERE shipmentId = ?`, [shipmentId], async (err,row) => {
            if(err){
                reject(err);
            }
            const shipmentAddress = row.shipmentAddress;
            const shipmentContract = await ethers.getContractAt('Shipment',shipmentAddress,provider);
            const buyer = await shipmentContract.getShipmentBuyer();
            RKWriteLog(`[ rk-chainapi ] 🚚 Buyer of shipment ${shipmentId} : ${buyer}`,'rk-chainapi');
            resolve(buyer);
        });
    });
} 

// function to get shipment seller
async function getShipmentSeller(shipmentId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT shipmentAddress FROM shipments WHERE shipmentId = ?`, [shipmentId], async (err,row) => {
            if(err){
                reject(err);
            }
            const shipmentAddress = row.shipmentAddress;
            const shipmentContract = await ethers.getContractAt('Shipment',shipmentAddress,provider);
            const seller = await shipmentContract.getShipmentSeller();
            RKWriteLog(`[ rk-chainapi ] 🚚 Seller of shipment ${shipmentId} : ${seller}`,'rk-chainapi');
            resolve(seller);
        });
    });
}

// function to get shipment order
async function getShipmentOrder(shipmentId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT shipmentAddress FROM shipments WHERE shipmentId = ?`, [shipmentId], async (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            const shipmentAddress = row.shipmentAddress;
            const shipmentContract = await ethers.getContractAt('Shipment',shipmentAddress,provider);
            const order = await shipmentContract.getShipmentOrder();
            RKWriteLog(`[ rk-chainapi ] 🚚 Order of shipment ${shipmentId} : ${order}`,'rk-chainapi');
            resolve(order);
        });
    });
}

// function to get shipment status
async function getShipmentStatus(shipmentId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT shipmentAddress FROM shipments WHERE shipmentId = ?`, [shipmentId], async (err,row) => {
            if(err){
                reject(err);
            }
            const shipmentAddress = row.shipmentAddress;
            const shipmentContract = await ethers.getContractAt('Shipment',shipmentAddress,provider);
            const status = await shipmentContract.getShipmentStatus();
            RKWriteLog(`[ rk-chainapi ] 🚚 Status of shipment ${shipmentId} : ${status}`,'rk-chainapi');
            resolve(status);
        });
    });
}

// functions that change the status of the shipment
//==============================================================================
// function to ship the shipment
async function shipShipment(shipmentId,wid){
    return new Promise(async (resolve,reject) =>  {
        // get the shipment contract address
        db.get(`SELECT shipmentAddress FROM shipments WHERE shipmentId = ?`, [shipmentId], async (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            // get the mail of the seller
            const sellerMail = await getShipmentSeller(shipmentId);
            // get the pkey of the seller from the wallets table
            const sellerPkey = await getWalletPrivateKey(wid);
            const seller = await new ethers.Wallet(sellerPkey,provider);
            const shipmentAddress = row.shipmentAddress;
            const shipmentContract = await ethers.getContractAt('Shipment',shipmentAddress,seller);
            let tx = await shipmentContract.ship();
            await tx.wait();
            RKWriteLog(`[ rk-chainapi ] 🚚 Shipment ${shipmentId} shipped at ${new Date(Date.now()).toISOString()}`,'rk-chainapi');
        });

        // update the shippedDate field in the shipments table
        db.run(`UPDATE shipments SET shippedDate = ? WHERE shipmentId = ?`,[Date.now(),shipmentId], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
        });

        // update the orderId field in the shipments table
        const orderId = await getShipmentOrder(shipmentId);
        db.run(`UPDATE shipments SET orderId = ? WHERE shipmentId = ?`,[orderId,shipmentId], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
        });
        RKWriteLog(`[ rk-chainapi ] 🚚 Shipment ${shipmentId} shipped at ${new Date(Date.now()).toISOString()}`,'rk-chainapi');
        resolve();
    });
}

// function to confirm the shipment ( confirm delivery )
async function confirmShipment(shipmentId,wid){
    return new Promise(async (resolve,reject) => {
        // get the shipment contract address
        db.get(`SELECT shipmentAddress FROM shipments WHERE shipmentId = ?`, [shipmentId], async (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            // get the mail of the seller
            const buyerMail = await getShipmentBuyer(shipmentId);
            // get the pkey of the seller from the wallets table
            const buyerPkey = await getWalletPrivateKey(wid);
            const buyer = await new ethers.Wallet(buyerPkey,provider);
            const shipmentAddress = row.shipmentAddress;
            const shipmentContract = await ethers.getContractAt('Shipment',shipmentAddress,buyer);
            let tx = await shipmentContract.confirmDelivery();
            await tx.wait();
            RKWriteLog(`[ rk-chainapi ] 🚚 Shipment ${shipmentId} confirmed at ${new Date(Date.now()).toISOString()}`,'rk-chainapi');
        });

        // update the deliveredDate field in the shipments table
        db.run(`UPDATE shipments SET deliveredDate = ? WHERE shipmentId = ?`,[Date.now(),shipmentId], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
        });
        RKWriteLog(`[ rk-chainapi ] 🚚 Shipment ${shipmentId} confirmed at ${new Date(Date.now()).toISOString()}`,'rk-chainapi');
        resolve();
    });
}

// function to cancel the shipment
async function cancelShipment(shipmentId, wid){
    return new Promise((resolve,reject) => {
        // get the shipment contract address
        db.get(`SELECT shipmentAddress FROM shipments WHERE shipmentId = ?`, [shipmentId], async (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            // get the mail of the buyer
            const buyerMail = await getShipmentBuyer(shipmentId);
            // get the pkey of the buyer from the wallets table
            const buyerPkey = await getWalletPrivateKey(wid);
            const buyer = await new ethers.Wallet(buyerPkey,provider);
            const shipmentAddress = row.shipmentAddress;
            const shipmentContract = await ethers.getContractAt('Shipment',shipmentAddress,buyer);
            let tx = await shipmentContract.cancelShipment();
            await tx.wait();
            RKWriteLog(`[ rk-chainapi ] 🚚 Shipment ${shipmentId} cancelled at ${new Date(Date.now()).toISOString()}`,'rk-chainapi');
        });
        resolve();
    });
}

// function to return the shipment
async function returnShipment(shipmentId,wid){
    return new Promise(async (resolve,reject) => {
        // get the shipment contract address
        db.get(`SELECT shipmentAddress FROM shipments WHERE shipmentId = ?`, [shipmentId], async (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            // get the mail of the buyer
            const buyerMail = await getShipmentBuyer(shipmentId);
            // get the pkey of the buyer from the wallets table
            const buyerPkey = await getWalletPrivateKey(wid);
            const buyer = await new ethers.Wallet(buyerPkey,provider);
            const shipmentAddress = row.shipmentAddress;
            const shipmentContract = await ethers.getContractAt('Shipment',shipmentAddress,buyer);
            let tx = await shipmentContract.returnShipment();
            await tx.wait();
            
        });
        RKWriteLog(`[ rk-chainapi ] 🚚 Shipment ${shipmentId} returned at ${new Date(Date.now()).toISOString()}`,'rk-chainapi');
        resolve();
    });
}




// Module exports
module.exports = {
    createDatabases,
    deleteTables,
    resetMeiliSearch,
    getWallets,
    getWalletPrivateKey,
    createWallet,
    deleteWallet,
    setPrimaryWallet,
    getWalletBalance,
    fundWallet,
    transferFunds,
    getTransactionDetails,
    getAddress,

    deployProductContract,
    setProductPrice,
    setProductQuantity,
    getProductQuantity,
    getProductPrice,
    getProductImage,
    getProductName,
    getProductSeller,
    getProductDescription,
    getProductAddress,
    getProductDateAdded,
    getProductDateUpdated,


    deployOrderContract,
    confirmOrder,
    cancelOrder,
    payOrder,
    updateOrderBuyer,
    getOrderSeller,
    getOrderBuyer,
    getOrderPlacedDate,
    getOrderConfirmedDate,
    getOrderCancelledDate,
    getOrderPaidDate,
    getOrderRefundedDate,
    getOrderProduct,
    getOrderQuantity,
    getOrderDeliveryAddress,
    getOrderPrice,
    getOrderTransaction,
    
    deployShipmentContract,
    getShipmentDestination,
    getShipmentSource,
    getShipmentShippedDate,
    getShipmentDeliveredDate,
    getShipmentBuyer,
    getShipmentSeller,
    getShipmentOrder,
    getShipmentStatus,
    shipShipment,
    confirmShipment,
    cancelShipment,
    returnShipment
};
