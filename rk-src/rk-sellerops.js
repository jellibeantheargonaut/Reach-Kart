// javascript implementation of seller operations
// uploadProduct
// removeProduct
// editProduct
// viewOrders
// viewBalance
// viewShop
// generateInvoice
// refundAmount
// 
// @author: JellibeanTheArgonaut

const sqlite3  = require('sqlite3');
const { v4: uuid } = require('uuid');
const path = require('path');
const chainApi = require('./rk-chainapi');
const loggingApi = require('./rk-logging');

const db = new sqlite3.Database(path.join(__dirname, 'data', 'reachkart.db'), (err) => {
    if(err){
        console.error(err.message);
    }
    console.log('[ rk-userops ] 📶 Connected to the rk database');
});

// wrappers for the functions in rk-chainapi.js
// setters and getters for the product

//====================================================================================
// functions related to Products from seller page
//====================================================================================
//
// function to get products availbale in the shop from the products table
//
export async function viewShop(email){
    const wid = await loggingApi.getWalletId(email);
    let products = [];
    return new Promise((resolve,reject) => {
        db.get(`SELECT * FROM products WHERE sellerAddress = ?`, [wid], (err,rows) => {
            if(err){
                reject(err);
            }
            rows.forEach(async (row) => {
                const data = {
                    productName: row.productName,
                    productID: row.productId,
                    productPrice: await chainApi.getProductPrice(row.productId),
                    productQuantity: await chainApi.getProductQuantity(row.productId),
                    productDescription: row.productDescription,
                }
                products.push(data);
            })
            console.log(`[ rk-sellerops ] 🛍️ Products in the shop of seller ${email}`);
            resolve(products);
        });
    });
}

// function to get all the details of a product

// function to upload a product to the shop
export async function uploadProduct(email,productName,productDescription,productPrice,productQuantity){
    return new Promise(async (resolve,reject) => {
        const wid = await loggingApi.getWalletId(email);
        try {
            await chainApi.deployProductContract(wid,productName,productDescription,productPrice,productQuantity);
            console.log(`[ rk-sellerops ] 📦 Product ${productName} uploaded by seller ${email}`);
            resolve(true);
        } catch (error) {
            reject(false);
        }
    });
}

//====================================================================================
// functions realted to Orders from seller page
//====================================================================================
//
// function to get orders from the shop from orders table
//
export async function viewOrders(email){
    const wid = await loggingApi.getWalletId(email);
    let orders = [];
    // get all the orders from the orders table
    return new Promise((resolve,reject) => {
        db.get(`SELECT * FROM orders WHERE sellerAddress = ?`, [wid], (err,rows) => {
            if(err){
                reject(err);
            }
            rows.forEach(async (row) => {
                const data = {
                    orderName: await chainApi.getProductName(row.productId),
                    orderID: row.orderId,
                    orderPrice: await chainApi.getOrderPrice(row.orderId),
                    orderBuyer: row.buyerAddress,
                    orderPlacedDate: await chainApi.getOrderPlacedDate(row.orderId),
                }
                orders.push(data);
            });
            console.log(`[ rk-sellerops ] 🛒 Orders to seller ${email}`);
            resolve(orders);
        })
    })
}

//====================================================================================
// functions related to Shipments from seller page
//====================================================================================
//
// function to get shipments from the shop from shipments table
export async function viewShipments(email){
    const wid = await loggingApi.getWalletId(email);
    let shipments = [];
    return new Promise((resolve,reject) => {
        db.get(`SELECT * FROM shipments WHERE sellerAddress = ?`, [wid], (err,rows) => {
            if(err){
                reject(err);
            }
            rows.forEach(async (row) => {
                const data = {
                    shipmentID: row.shipmentId,
                    shipmentProduct: await chainApi.getProductName(row.productId),
                    shipmentQuantity: row.quantity,
                    shipmentBuyer: row.buyerAddress,
                    shipmentDate: row.shipmentDate,
                }
                shipments.push(data);
            });
            console.log(`[ rk-sellerops ] 🚚 Shipments from seller ${email}`);
            resolve(shipments);
        });
    });
}

//====================================================================================
// functions related to Transactions from seller page
//====================================================================================