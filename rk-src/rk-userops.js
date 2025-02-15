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
const path = require('path')

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
                    console.log(rows);
                    resolve(rows);
                });
            }
        });
    });
}




// module to export the functions
module.exports = {
    addAddress,
    getAddresses,
    viewOrders
}