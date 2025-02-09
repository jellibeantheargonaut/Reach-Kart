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

const { sqlite3 } = require('sqlite3');
const { ethers } = require('hardhat');
const { getWalletId } = require('./rk-logging');
const { v4: uuid } = require('uuid');

// function to place an order
// this function calls apis from rk-chainapi.js
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