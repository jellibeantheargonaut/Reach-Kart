// javascript file for user operations like buying, viewing products etc.
// what user does after logging in
// viewProducts
// viewOrders
// buyProduct
// cancelOrder
// payForOrder
// trackOrder
// viewBalance
// 
// @author: JellibeanTheArgonaut

const sqlite3  = require('sqlite3');
const { v4: uuid } = require('uuid');
const path = require('path');
const chainApi = require('./rk-chainapi');
const loggingApi = require('./rk-logging');
const { RKWriteLog } = require('./rk-logs');
const { createClient } = require('redis');

// connect to the redis server
const redisClient = createClient({ url: 'redis://localhost:6379' });

redisClient.connect().catch(err => {
    RKWriteLog(`[ rk-userops ] ❌ Error connecting to redis server`,'rk-error');
});

const db = new sqlite3.Database(path.join(__dirname, 'data', 'reachkart.db'), (err) => {
    if(err){
        console.error(err.message);
    }
    RKWriteLog('[ rk-userops ] 📶 Connected to the rk database','rk-userops');
});

async function clearRedis() {
    try {
        await redisClient.flushAll(); // Clear all keys from all databases
        RKWriteLog(`[ rk-userops ] 🗑️ All data in Redis has been cleared`, 'rk-userops');
    } catch (err) {
        RKWriteLog(`[ rk-userops ] ❌ Error clearing Redis: ${err.message}`, 'rk-error');
        throw err;
    }
}
// function to place an order
// these apis are called from the server
// to place an order
//
//
// @param {string} productId - the id of the product to be ordered
// @param {number} quantity - the quantity of the product to be ordered
// @param {string} address - the address of the buyer
// 
// function returns the address of the Order contract and store it in the database


// function to confirm the order
// this function calls apis from rk-chainapi.js
// to confirm an order
// gets the Order contract address from the database
// and calls the confirmOrder function from rk-chainapi.js
//
// @param {string} orderId - the id of the order to be confirmed
// @param {string} address - the address of the buyer ( address of the wallet )


// function to cancel and order
// this function calls apis from rk-chainapi.js
// to cancel an order
// gets the Order contract address from the database
// and calls the cancelOrder function from rk-chainapi.js
//
// @param {string} orderId - the id of the order to be cancelled
// @param {string} address - the address of the buyer ( address of the wallet )
// gets refund if the order is paid for


// function to pay for an order
// this function calls apis from rk-chainapi.js
// to pay for an order
// gets the Order contract address from the database
// and calls the payOrder function from rk-chainapi.js
//
// @param {string} orderId - the id of the order to be paid for
// @param {string} address - the address of the buyer ( address of the wallet )


// function to generate an invoice
// 
// @param {string} orderId - the id of the order for which the invoice is to be generated
// @param {string} address - the address of the buyer ( address of the wallet )
// @parma {string} sellerId - the id of the seller ( address of the wallet )
// @param {string} productId - the id of the product

// function to add the address of user to the database
async function addAddress(email, address){
    return new Promise((resolve,reject) => {
        const addressId = uuid();
        db.run(`INSERT INTO addresses (addressId, email, addressValue) VALUES (?,?,?)`, [addressId, email, address], (err) => {
            if(err){
                RKWriteLog(`[ rk-userops ] ❌ Error adding address for ${email} in the database`,'rk-error');
                reject(err);
            }
            RKWriteLog(`[ rk-userops ] 📫 Address added for ${email} in the database`,'rk-userops');
            resolve(addressId);
        });
    });
}

async function getAddresses(email){
    return new Promise((resolve,reject) => {
        db.all(`SELECT * FROM addresses WHERE email = ?`, [email], (err,rows) => {
            if(err){
                RKWriteLog(`[ rk-userops ] ❌ Error getting addresses of ${email}`,'rk-error');
                reject(rows);
            }
            RKWriteLog(`[ rk-userops ] 📫 Addresses of ${email}`,'rk-userops');
            resolve(rows);
        });
    });
}

async function getWallets(email){
    return new Promise(async (resolve,reject) => {
        try {
            let wallets = await chainApi.getWallets(email);
            let details = [];
            for(const wallet of wallets){
                const data = {
                    walletId: wallet.wid,
                    balance: await chainApi.getWalletBalance(wallet.wid)
                }
                details.push(data);
            }
            RKWriteLog(`[ rk-userops ] 💰 Wallets of ${email}`,'rk-userops');
            resolve(details);
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}

// function to get transactions of a user
// from orders table if transactionId is not null
async function getTransactions(email){
    const wallets = (await chainApi.getWallets(email)).map(wallet => `'${wallet.wid}'`).join(',');
    let transactions = [];
    return new Promise((resolve,reject) => {
        db.all(`SELECT * FROM orders WHERE buyerAddress IN (${wallets}) AND transactionId IS NOT NULL`, async (err,rows) => {
            if(err){
                reject(err);
            }
            for(const row of rows){
                const data = {
                    transactionId: row.transactionId,
                    transactionFrom: row.buyerAddress,
                    transactionTo: row.sellerAddress,
                    transactionAmount: await chainApi.getOrderPrice(row.orderId),
                    transactionDate: await chainApi.getOrderPaidDate(row.orderId),
                }
                transactions.push(data);
            }
            RKWriteLog(`[ rk-sellerops ] 📈 Transactions to seller ${email}`,'rk-sellerops');
            resolve(transactions);
        });
    });  
}

// function to generate the transaction receipt
async function getTransactionReceipt(txHash) {
    return new Promise(async (resolve,reject) => {
        try {
            const details = await chainApi.getTransactionDetails(txHash);
            const data = {
                transactionHash: txHash,
                transactionFrom: details.from,
                transactionTo: details.to,
                transactionAmount: details.value,
                transactionDate: details.time,
                transactionSenderMail: await loggingApi.getEmail(details.from),
                transactionReceiverMail: await loggingApi.getEmail(details.to)
            }
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

//========================================================================================================
// Orders related functions
//========================================================================================================
// function to place an order
async function placeOrder(wid, productId, quantity, deliveryAddress){
    return new Promise(async (resolve,reject) => {
        const sellerWid = await chainApi.getProductSeller(productId);
        const buyerWid = wid;
        await chainApi.deployOrderContract(buyerWid, sellerWid, productId, quantity, deliveryAddress).catch(err => {
            RKWriteLog(`[ rk-userops ] ❌ Error placing order for ${productId}`,'rk-error');
            reject(err);
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        RKWriteLog(`[ rk-userops ] 📦 Order placed for ${productId} by user ${wid}`,'rk-userops');
        resolve();
    });
}

// function to confirm the order
async function confirmOrder(orderId){
    // binding for the confirmOrder function in rk-chainapi
    return new Promise(async (resolve,reject) => {
        await chainApi.confirmOrder(orderId).catch(err => {
            RKWriteLog(`[ rk-userops ] ❌ Error confirming order ${orderId}`,'rk-error');
            reject(err);
        });
        RKWriteLog(`[ rk-userops ] 📦 Order ${orderId} confirmed`,'rk-userops');
        resolve();
    });
}

// function to cancel and order
async function cancelOrder(orderId){
    // binding for the cancelOrder function in rk-chainapi
    return new Promise(async (resolve,reject) => {
        await chainApi.cancelOrder(orderId).catch(err => {
            RKWriteLog(`[ rk-userops ] ❌ Error cancelling order ${orderId}`,'rk-error');
            reject(err);
        });
        RKWriteLog(`[ rk-userops ] 📦 Order ${orderId} cancelled`,'rk-userops');
        resolve();
    });
}

// function to pay for an order
async function payForOrder(orderId){
    // binding for the payOrder function in rk-chainapi
    return new Promise(async (resolve,reject) => {
        const tx = await chainApi.payOrder(orderId).catch(err => {
            RKWriteLog(`[ rk-userops ] ❌ Error paying for order ${orderId}`,'rk-error');
            reject(err);
        });
        RKWriteLog(`[ rk-userops ] 💸 Order ${orderId} paid for`,'rk-userops');
        resolve(tx.hash);
    });

    // sometimes the wid used for deploying order contract is different from the one used for paying
    // implementation to use alternate wid for paying
}

// function to view orders
async function viewOrders(email){
    return new Promise((resolve,reject) => {
        // get wid from the email from the users table
        db.get(`SELECT wid FROM users WHERE email = ?`, [email], (err, row) => {
            if(err){
                console.error(err.message);
                reject(row);
            }
            if(row){
                const wid = row.wid;
                // get all the orders from the orders table
                db.all(`SELECT * FROM orders WHERE buyerAddress = ?`, [wid], (err, rows) => {
                    if(err){
                        console.error(err.message);
                        reject(rows);
                    }
                    RKWriteLog(`[ rk-userops ] 📦 Orders of ${email}`,'rk-userops');
                    resolve(rows);
                });
            }
        });
    });
}

// function to generate a bill for the order
async function generateBill(orderId){

    return new Promise(async (resolve, reject) => {
        RKWriteLog(`[ rk-userops ] 🧾 Generating bill for order ${orderId}`,'rk-userops')
        // get ordet placed date
        const orderPlaced = await chainApi.getOrderPlacedDate(orderId);
        // get order payment date
        const orderPaid = await chainApi.getOrderPaidDate(orderId);
        // get order transaction
        const orderTransaction = await chainApi.getOrderTransaction(orderId);
        // get product id of the order
        const orderProductId = await chainApi.getOrderProduct(orderId);
        // get quantity of the product
        const orderQuantity = await chainApi.getOrderQuantity(orderId);
        // get order total
        const orderPrice = await chainApi.getOrderPrice(orderId);
        // getting the product details
        const productName = await chainApi.getProductName(orderProductId);
        const productDescription = await chainApi.getProductDescription(orderProductId)
        // payload of the bill
        const bill = {
            orderId: orderId,
            orderPlaced: orderPlaced,
            orderPaid: orderPaid,
            productId: orderProductId,
            productName: productName,
            productDescription: productDescription,
            quantity: orderQuantity,
            price: orderPrice,
            transaction: orderTransaction
        }
        resolve(bill);
    });
}

// function to generate the shipment bill
async function generateShipmentBill(shipmentId){
    return new Promise(async (resolve, reject) => {
        RKWriteLog(`[ rk-userops ] 🧾 Generating shipment bill for shipment ${shipmentId}`,'rk-userops');   
        // get the shipment buyer
        const shipmentBuyer = await chainApi.getShipmentBuyer(shipmentId);
        // get shipment seller
        const shipmentSeller = await chainApi.getShipmentSeller(shipmentId);
        // get the source address
        const shipmentSource = await chainApi.getShipmentSource(shipmentId);
        // get the destination address
        const shipmentDestination = await chainApi.getShipmentDestination(shipmentId);
        // get the shipment order
        const shipmentOrder = await chainApi.getShipmentOrder(shipmentId);

        // payload of the shipment bill
        const shipmentBill = {
            shipmentId: shipmentId,
            buyer: shipmentBuyer,
            seller: shipmentSeller,
            source: shipmentSource,
            destination: shipmentDestination,
            order: shipmentOrder
        }
        resolve(shipmentBill);
        
    });
}

//========================================================================================================
// function to perform query on products table and return the results
// this function is called from the server
async function searchProducts(query){
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM products WHERE name LIKE ? LIMIT 10`, ['%' + query + '%'], (err, rows) => {
            if(err){
                console.error(err.message);
                reject(rows);
            }
            RKWriteLog(`[ rk-userops ] 🔍 Search results for ${query}`,'rk-userops');
            resolve(rows);
        });
    });
}

// function to get user account details
async function getUserAccountDetails(email){
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, row) => {
            if(err){
                console.error(err.message);
                reject(row);
            }
            const data = {
                name: row.name,
                email: row.email,
                walletId: row.wid,
                address: await getAddresses(email)
            }
            RKWriteLog(`[ rk-userops ] 📦 Account details of ${email}`,'rk-userops');
            resolve(data);
        });
    });
}


//========================================================================================================
// Cart managing functions
//========================================================================================================
// function to add a product to cart
async function addToCart(email,productId,quantity){
    return new Promise(async (resolve,reject) => {
        await redisClient.hSet(email, productId, quantity, (err) => {
            if(err){
                RKWriteLog(`[ rk-userops ] ❌ Error adding ${productId} to cart`,'rk-error');
                reject(err);
            }
        });
        RKWriteLog(`[ rk-userops ] 🛒 ${email} added ${quantity} items ${productId} to cart`,'rk-userops');
        resolve();
    });
}

// function to update the quantity of a product in cart
async function updateCart(email,productId,quantity){
    return new Promise(async (resolve,reject) => {
        redisClient.hSet(email, productId, quantity, (err) => {
            if(err){
                RKWriteLog(`[ rk-userops ] ❌ Error updating ${productId} in cart`,'rk-error');
                reject(err);
            }
        });
        RKWriteLog(`[ rk-userops ] 🛒 ${email} updated ${quantity} items ${productId} in cart`,'rk-userops');
        resolve();
    });
}

// function to remove a product from cart
async function removeFromCart(email,productId){
    return new Promise(async (resolve,reject) => {
        redisClient.hDel(email, productId, (err) => {
            if(err){
                RKWriteLog(`[ rk-userops ] ❌ Error removing ${productId} from cart`,'rk-error');
                reject(err);
            }
        });
        RKWriteLog(`[ rk-userops ] 🛒 ${email} removed ${productId} from cart`,'rk-userops');
        resolve();
    });
}

// function to view cart
async function viewCart(email){
    return new Promise(async (resolve,reject) => {
        const data = await redisClient.hGetAll(email, (err) => {
            if(err){
                RKWriteLog(`[ rk-userops ] ❌ Error getting cart of ${email}`,'rk-error');
                reject(err);
            }
        });
        const keys = Object.keys(data);
        let cart = [];
        for (const key of keys){
            const product = {
                productId: key,
                productName: (await chainApi.getProductName(key)),
                productDescription: (await chainApi.getProductDescription(key)),
                productImage: (await chainApi.getProductImage(key)) || 'https://pixsector.com/cache/517d8be6/av5c8336583e291842624.png',
                productPrice: (await chainApi.getProductPrice(key)),
                quantity: data[key],
                price: (await chainApi.getProductPrice(key))*data[key]
            }
            cart.push(product);
        }
        RKWriteLog(`[ rk-userops ] 🛒 ${email} cart viewed`,'rk-userops');
        resolve(cart);
    });
}

// function to checkout cart
async function checkoutCart(email,wid,deliveryAddress){
    const cartItems = await viewCart(email);
    for(const item of cartItems){
        try {
            await placeOrder(wid, item.productId, item.quantity, deliveryAddress);
        } catch(err) {
            return false;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    emptyCart(email);
    return true;
}

// function to empty cart
async function emptyCart(email){
    return new Promise(async (resolve,reject) => {
        const fields = await redisClient.hKeys(email, (err) => {
            if(err){
                RKWriteLog(`[ rk-userops ] ❌ Error getting cart of ${email}`,'rk-error');
                reject(err);
            }
        });
        if(fields.length > 0){
            for(const field of fields){
                redisClient.hDel(email, field, (err) => {
                    if(err){
                        RKWriteLog(`[ rk-userops ] ❌ Error emptying cart of ${email}`,'rk-error');
                        reject(err);
                    }
                });
            }
        }
        RKWriteLog(`[ rk-userops ] 🛒 ${email} cart emptied`,'rk-userops');
        resolve();
    });
}


// module to export the functions
module.exports = {
    clearRedis,

    addAddress,
    getAddresses,
    getTransactions,
    getTransactionReceipt,
    getWallets,
    getUserAccountDetails,
    viewOrders,
    placeOrder,
    confirmOrder,
    cancelOrder,
    payForOrder,
    generateBill,
    generateShipmentBill,

    addToCart,
    updateCart,
    viewCart,
    emptyCart,
    removeFromCart,
    checkoutCart
}