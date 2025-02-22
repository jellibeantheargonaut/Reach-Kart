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

// setting up sqlite3 database
// create new if not exists
if(!fs.existsSync('./data/reachkart.db')){
    console.log('[ rk-chainapi ] 📂 Database not found. Creating a new one');
    fs.openSync('./data/reachkart.db', 'w');
    console.log('[ rk-chainapi ] 📂 Database created');
}

const db = new sqlite3.Database(path.join(__dirname, 'data', 'reachkart.db'), (err) => {
    if(err){
        console.error(err.message);
    }
    console.log('[ rk-chainapi ] 📶 Connected to the rk database');
});

const provider = new ethers.JsonRpcProvider('http://localhost:8545');
console.log('[ rk-chainapi ] 📶 Connected to the hardhat network');

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
    console.log('[ rk-chainapi ] 👍🏻 Users table created');

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
    console.log('[ rk-chainapi ] 👍🏻 Orders table created');

    // create the products table if not exists
    await new Promise(resolve => {
        db.run(`CREATE TABLE IF NOT EXISTS products (
            productId string PRIMARY KEY,
            productAddress string NOT NULL,
            dateAdded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            dateUpdated TIMESTAMP)`
        );
        resolve();
    });
    console.log('[ rk-chainapi ] 👍🏻 Products table created');

    // create the wallets table if not exists
    await new Promise(resolve => {
        db.run(`CREATE TABLE IF NOT EXISTS wallets (
            wid string PRIMARY KEY,
            pk string NOT NULL,
            email string NOT NULL)`
        );
        resolve();
    });
    console.log('[ rk-chainapi ] 👍🏻 Wallets table created');

    // create the addresses table if not exists
    await new Promise(resolve => {
        db.run(`CREATE TABLE IF NOT EXISTS addresses (
            email string PRIMARY KEY,
            address string NOT NULL)`
        );
        resolve();
    });
    console.log('[ rk-chainapi ] 👍🏻 Addresses table created');

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
    console.log('[ rk-chainapi ] 👍🏻 Shipments table created');

    console.log('[ rk-chainapi ] 👍🏻 Database and tables created');
}
// function to delete tables in database
function deleteTables(){
    db.run(`DROP TABLE IF EXISTS users`);
    console.log('🪓 Users table deleted');
    db.run(`DROP TABLE IF EXISTS orders`);
    console.log('🪓 Orders table deleted');
    db.run(`DROP TABLE IF EXISTS products`);
    console.log('🪓 Products table deleted');
    db.run(`DROP TABLE IF EXISTS wallets`);
    console.log('🪓 Wallets table deleted');
    db.run(`DROP TABLE IF EXISTS addresses`);
    console.log('🪓 Addresses table deleted');
    db.run(`DROP TABLE IF EXISTS shipments`);
    console.log('🪓 Shipments table deleted');
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
            console.log(`[ rk-chainapi ] 💳 Wallet ${wid} created for user ${email}`);
        });
        console.log(`[ rk-chainapi ] 💳 Wallet ${wid} connected to hardhat network`);
        resolve(wid);
    });
}

// function to get the balance of a wallet
async function getWalletBalance(wid){
    return new Promise(async (resolve,reject) => {
        const balance = await provider.getBalance(wid);
        console.log(`[ rk-chainapi ] 💵 Balance of wallet ${wid} is ${ethers.formatEther(balance)}`);
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
        console.log(`[ rk-chainapi ] 🤑 Wallet ${wid} funded with ${amount} ETH`);
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
        console.log(`[ rk-chainapi ] 💵 ${amount} ETH transferred from ${buyerWid} to ${sellerWid}`);

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


//==================================================================================
// Product Smart contract APIs (these are for the seller)
//==================================================================================

// deploy the product contract
async function deployProductContract(sellerAddress, productName, productDescription, productPrice, productQuantity)
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
        console.log(`[ rk-chainapi ] 📦 Product ${productId} created by seller ${sellerAddress}`);
        const productContract = await Product.deploy(sellerAddress,productId,productName,productDescription,etherPrice,productQuantity);
        console.log(`[ rk-chainapi ] 📦 Product contract deployed at ${productContract.address}`);

        // insert the product into the products table
        db.run(`INSERT INTO products(productId,productAddress,dateAdded) VALUES(?,?,?)`,[productId,await productContract.getAddress(),Date.now()], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            console.log(`[ rk-chainapi ] 📦 Product ${productId} entered in database table`);
        });
        resolve();
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
            console.log(`[ rk-chainapi ] 📦 Product ${productId} price set to ${productPrice}`);
        });

        // update the dateUpdated field in the products table
        db.run(`UPDATE products SET dateUpdated = ? WHERE productId = ?`,[Date.now(),productId], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            console.log(`[ rk-chainapi ] 📦 Product ${productId} updated in database table`);
        });
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
            console.log(`[ rk-chainapi ] 📦 Product ${productId} quantity set to ${productQuantity}`);
        });

        // update the dateUpdated field in the products table
        db.run(`UPDATE products SET dateUpdated = ? WHERE productId = ?`,[Date.now(),productId], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            console.log(`[ rk-chainapi ] 📦 Product ${productId} updated in database table`);
        });
        resolve();
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
            console.log(`[ rk-chainapi ] 💵 Price of product ${productId} is ${productPrice}`);
            resolve(ethers.formatEther(productPrice));
        });
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
        console.log(`[ rk-chainapi ] 📦 Quantity of product ${productId} is ${productQuantity}`);
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
            console.log(`[ rk-chainapi ] 📦 Name of product ${productId} : ${productName}`);
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
            console.log(`[ rk-chainapi ] 📦 Description of product ${productId} : ${productDescription}`);
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
async function deployOrderContract(buyerAddress, sellerAddress, productId, productQuantity){

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
            console.log(`[ rk-chainapi ] 💵 Total price of order for product ${productId} is ${ethers.formatEther(totalPrice)}`);

            // deploy the order contract
            // get buyer pkey
            const buyerPkey = await getWalletPrivateKey(buyerAddress);
            // get the walet of the buyer
            const buyer = await new ethers.Wallet(buyerPkey,provider);
            const Order = await ethers.getContractFactory('Order',buyer);
            const orderId = uuid();
            const orderContract = await Order.deploy(Date.now(),sellerAddress,buyerAddress,orderId,totalPrice,productQuantity);
            console.log(`[ rk-chainapi ] 👍🏻 Order contract deployed at ${orderContract.address}`);

            // insert the order into the orders table
            db.run(`INSERT INTO orders(orderId,orderAddress,productId,buyerAddress,sellerAddress,orderPlaced) VALUES(?,?,?,?,?,?)`,[orderId,await orderContract.getAddress(),productId,buyerAddress,sellerAddress,Date.now()], (err) => {
                if(err){
                    console.error(err.message);
                    reject(err);
                }
                console.log(`[ rk-chainapi ] 👍🏻 Order ${orderId} entered in database table for ${productId}`);
            });
        });
        resolve();
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
            console.log(`[ rk-chainapi ] 👍🏻 Order ${orderId} confirmed at ${new Date(Date.now()).toISOString()}`);
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
            console.log(`[ rk-chainapi ] 👎🏻 Order ${orderId} cancelled at ${new Date(Date.now()).toISOString()}`);
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
            console.log(`[ rk-chainapi ] 💳 Buyer: ${buyerWid}`)
            // get the seller wallet address
            const sellerWid = await orderContract.getOrderSeller();
            console.log(`[ rk-chainapi ] 💳 Seller: ${sellerWid}`);

            // transfer the funds from buyer to seller
            let txId = await transferFunds(buyerWid,sellerWid,ethers.formatEther(orderPrice));
            // update the transactionId field in the orders table
            db.run(`UPDATE orders SET transactionId = ? WHERE orderId = ?`,[txId,orderId], (err) => {
                if(err){
                    console.error(err.message);
                    reject(err);
                }
                console.log(`[ rk-chainapi ] 👍🏻 Order ${orderId} transactionId updated to ${txId}`);
            });
        });
        // update the orderPaid field in the orders table
        db.run(`UPDATE orders SET orderPaid = ? WHERE orderId = ?`,[Date.now(),orderId], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            console.log(`[ rk-chainapi ] 👍🏻 Order ${orderId} paid at ${new Date(Date.now()).toISOString()}`);
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
async function deployShipmentContract(buyerMail, sellerMail, orderId){
    
    return new Promise(async (resolve,reject) => {
        // generate the shipment id
        const shipmentId = uuid();

        // get the seller wallet address
        const sellerWid = await getWallets(sellerMail);
        const seller = await new ethers.Wallet(sellerWid[0].pk,provider);

        // deploy the shipment contract
        const Shipment = await ethers.getContractFactory('Shipment',seller);
        const shipmentContract = await Shipment.deploy(Date.now(),shipmentId,orderId,buyerMail,sellerMail);
        console.log(`[ rk-chainapi ] 🚚 Shipment contract deployed at ${await shipmentContract.getAddress()}`);

        // insert the shipment into the shipments table
        db.run(`INSERT INTO shipments(shipmentId,shipmentAddress,shippedDate) VALUES(?,?,?)`,[shipmentId,await shipmentContract.getAddress(),Date.now()], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            console.log(`[ rk-chainapi ] 🚚 Shipment ${shipmentId} entered in database table`);
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

            // buyer mail is the destination address
            const destination = await shipmentContract.getShipmentBuyer();
            // get the address of the buyer from the addresses table
            db.get(`SELECT address FROM addresses WHERE email = ?`,[destination], (err,row) => {
                if(err){
                    reject(err);
                }
                resolve(row.address);
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

            // seller mail is the source address
            const source = await shipmentContract.getShipmentSeller();
            // get the address of the seller from the addresses table
            db.get(`SELECT address FROM addresses WHERE email = ?`,[source], (err,row) => {
                if(err){
                    reject(err);
                }
                resolve(row.address);
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
            console.log(`[ rk-chainapi ] 🚚 Buyer of shipment ${shipmentId} : ${buyer}`);
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
            console.log(`[ rk-chainapi ] 🚚 Seller of shipment ${shipmentId} : ${seller}`);
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
            console.log(`[ rk-chainapi ] 🚚 Order of shipment ${shipmentId} : ${order}`);
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
            console.log(`[ rk-chainapi ] 🚚 Status of shipment ${shipmentId} : ${status}`);
            resolve(status);
        });
    });
}

// functions that change the status of the shipment
//==============================================================================
// function to ship the shipment
async function shipShipment(shipmentId){
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
            const sellerWid = await getWallets(sellerMail);
            const seller = await new ethers.Wallet(sellerWid[0].pk,provider);
            const shipmentAddress = row.shipmentAddress;
            const shipmentContract = await ethers.getContractAt('Shipment',shipmentAddress,seller);
            let tx = await shipmentContract.ship();
            await tx.wait();
            console.log(`[ rk-chainapi ] 🚚 Shipment ${shipmentId} shipped at ${new Date(Date.now()).toISOString()}`);
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
        console.log(`[ rk-chainapi ] 🚚 Shipment ${shipmentId} shipped at ${new Date(Date.now()).toISOString()}`);
        resolve();
    });
}

// function to confirm the shipment ( confirm delivery )
async function confirmShipment(shipmentId){
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
            const buyerWid = await getWallets(buyerMail);
            const buyer = await new ethers.Wallet(buyerWid[0].pk,provider);
            const shipmentAddress = row.shipmentAddress;
            const shipmentContract = await ethers.getContractAt('Shipment',shipmentAddress,buyer);
            let tx = await shipmentContract.confirmDelivery();
            await tx.wait();
            console.log(`[ rk-chainapi ] 🚚 Shipment ${shipmentId} confirmed at ${new Date(Date.now()).toISOString()}`);
        });

        // update the deliveredDate field in the shipments table
        db.run(`UPDATE shipments SET deliveredDate = ? WHERE shipmentId = ?`,[Date.now(),shipmentId], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
        });
        console.log(`[ rk-chainapi ] 🚚 Shipment ${shipmentId} confirmed at ${new Date(Date.now()).toISOString()}`);
        resolve();
    });
}

// function to cancel the shipment
async function cancelShipment(shipmentId){
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
            const buyerWid = await getWallets(buyerMail);
            const buyer = await new ethers.Wallet(buyerWid[0].pk,provider);
            const shipmentAddress = row.shipmentAddress;
            const shipmentContract = await ethers.getContractAt('Shipment',shipmentAddress,buyer);
            let tx = await shipmentContract.cancelShipment();
            await tx.wait();
            console.log(`[ rk-chainapi ] 🚚 Shipment ${shipmentId} cancelled at ${new Date(Date.now()).toISOString()}`);
        });
        resolve();
    });
}

// function to return the shipment
async function returnShipment(shipmentId){
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
            const buyerWid = await getWallets(buyerMail);
            const buyer = await new ethers.Wallet(buyerWid[0].pk,provider);
            const shipmentAddress = row.shipmentAddress;
            const shipmentContract = await ethers.getContractAt('Shipment',shipmentAddress,buyer);
            let tx = await shipmentContract.returnShipment();
            await tx.wait();
            
        });
        console.log(`[ rk-chainapi ] 🚚 Shipment ${shipmentId} returned at ${new Date(Date.now()).toISOString()}`);
        resolve();
    });
}




// Module exports
module.exports = {
    createDatabases,
    deleteTables,
    getWallets,
    createWallet,
    getWalletBalance,
    fundWallet,
    transferFunds,
    getTransactionDetails,

    deployProductContract,
    setProductPrice,
    setProductQuantity,
    getProductQuantity,
    getProductPrice,
    getProductName,
    getProductDescription,
    getProductAddress,
    getProductDateAdded,
    getProductDateUpdated,


    deployOrderContract,
    confirmOrder,
    cancelOrder,
    payOrder,
    getOrderPlacedDate,
    getOrderConfirmedDate,
    getOrderCancelledDate,
    getOrderPaidDate,
    getOrderRefundedDate,
    getOrderProduct,
    getOrderQuantity,
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