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

const db = new sqlite3.Database(path.join(__dirname, 'data', 'reachkart.db'), (err) => {
    if(err){
        console.error(err.message);
    }
    console.log('[ rk-userops ] 📶 Connected to the rk database');
});

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
    const query = `INSERT INTO addresses (email, address) VALUES (?, ?)`;
    db.run(query, [email, address], (err) => {
        if(err){
            console.error(err.message);
        }
        console.log('[ rk-userops ] 📫 Address added to the database');
    });
}

async function getAddresses(email){
    return new Promise((resolve,reject) => {
        db.get(`SELECT address FROM addresses WHERE email = ?`, [email], (err,rows) => {
            if(err){
                console.log(err.message);
                reject(rows);
            }
            console.log(`[ rk-userops ] 📫 Addresses of ${email}`);
            resolve(rows);
        });
    });
}

// function to get transactions of a user
async function getTransactions(email){
    return new Promise((resolve,reject) => {
        // get wid from the email from the users table
        db.get(`SELECT wid FROM users WHERE email = ?`, [email], (err, row) => {
            if(err){
                console.error(err.message);
                reject(row);
            }
            const wid = row.wid;
            // get transactionId from the orders table
            db.all(`SELECT transactionId FROM orders WHERE buyerAddress = ?`, [wid], (err, rows) => {
                if(err){
                    console.error(err.message);
                    reject(rows);
                }
                console.log(`[ rk-userops ] 📦 Transactions of ${email}`);
                let transactions;
                rows.forEach(async (row) => {
                    const data = await chainApi.getTransactionDetails(row.transactionId);
                    console.log(data);
                    transactions.push(data);
                });
                console.log(transactions);
                resolve(transactions);
            });
        });
    });
}

//========================================================================================================
// Orders related functions
//========================================================================================================
// function to place an order
// function to confirm the order
// function to cancel and order
// function to pay for an order

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
                    console.log(`[ rk-userops ] 📦 Orders of ${email}`);
                    resolve(rows);
                });
            }
        });
    });
}

// function to generate a bill for the order
async function generateBill(orderId){

    return new Promise(async (resolve, reject) => {
        console.log(`[ rk-userops ] 🧾 Generating bill for order ${orderId}`)
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
        console.log(`[ rk-userops ] 🧾 Generating shipment bill for shipment ${shipmentId}`);   
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
            console.log(`[ rk-userops ] 🔍 Search results for ${query}`);
            console.log(rows);
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
            console.log(`[ rk-userops ] 📦 Account details of ${email}`);
            resolve(data);
        });
    });
}




// module to export the functions
module.exports = {
    addAddress,
    getAddresses,
    getTransactions,
    getUserAccountDetails,
    viewOrders,
    generateBill,
    generateShipmentBill
}