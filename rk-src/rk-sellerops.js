// javascript implementation of seller operations
// 
// @author: JellibeanTheArgonaut

const sqlite3 = require('sqlite3');
const { v4: uuid } = require('uuid');
const path = require('path');
const chainApi = require('./rk-chainapi');
const loggingApi = require('./rk-logging');
const { RKWriteLog } = require('./rk-logs');

const db = new sqlite3.Database(path.join(__dirname, 'data', 'reachkart.db'), (err) => {
  if (err) {
    console.error(err.message);
  }
  RKWriteLog('[ rk-userops ] 📶 Connected to the rk database', 'rk-sellerops');
});

// wrappers for the functions in rk-chainapi.js
// setters and getters for the product

//====================================================================================
// functions related to Products from seller page
//====================================================================================
//
// function to get products availbale in the shop from the products table
//
async function viewShop(email) {
  let products = [];
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM products WHERE sellerMail = ?`, [email], async (err, rows) => {
      if (err) {
        return reject(err);
      }
      try {
        for (const row of rows) {
          const data = {
            productId: row.productId,
            productName: await chainApi.getProductName(row.productId),
            productPrice: await chainApi.getProductPrice(row.productId),
            productQuantity: await chainApi.getProductQuantity(row.productId),
            productDescription: await chainApi.getProductDescription(row.productId),
            productImage: await chainApi.getProductImage(row.productId)
          };
          products.push(data);
        }
        RKWriteLog(`[ rk-sellerops ] 🛍️ Products in the shop of seller ${email}`, 'rk-sellerops');
        resolve(products);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// function to get all the details of a product

// function to upload a product to the shop
async function uploadProduct(email, wid, productName, productDescription, productImage, productPrice, productQuantity, productTags) {
  return new Promise(async (resolve, reject) => {
    try {
      const pId = await chainApi.deployProductContract(email, wid, productName, productDescription, productImage, productPrice, productQuantity, productTags);
      RKWriteLog(`[ rk-sellerops ] 📦 Product ${productName} uploaded by seller ${wid}`, 'rk-sellerops');
      resolve(pId);
    } catch (error) {
      reject(error);
    }
  });
}

//====================================================================================
// functions realted to Orders from seller page
//====================================================================================
//
// function to get orders from the shop from orders table
//
async function viewOrders(email) {
  const wallets = await chainApi.getWallets(email);
  const wids = wallets.map(wallet => `'${wallet.wid}'`).join(',');
  let orders = [];
  // get all the orders from the orders table
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM orders WHERE sellerAddress IN (${wids})`, async (err, rows) => {
      if (err) {
        reject(err);
      }
      if (!rows || rows.length === 0) {
        return resolve([]);
      }
      for (const row of rows) {
        console.log(row);
        const data = {
          orderName: await chainApi.getProductName(row.productId),
          orderId: row.orderId,
          orderPrice: await chainApi.getOrderPrice(row.orderId),
          orderBuyer: row.buyerAddress,
          orderPlacedDate: await chainApi.getOrderPlacedDate(row.orderId),
        }
        orders.push(data);
      }
      RKWriteLog(`[ rk-sellerops ] 🛒 Orders to seller ${email}`, 'rk-sellerops');
      resolve(orders);
    });
  })
}

async function viewOrder(orderId) {
  return new Promise(async (resolve, reject) => {
    // get the email of the buyer details
    const buyer = await loggingApi.getEmail(await chainApi.getOrderBuyer(orderId));
    const quantity = await chainApi.getOrderQuantity(orderId);
    const price = await chainApi.getOrderPrice(orderId);

    // get the order dates
    const orderPlacedDate = await chainApi.getOrderPlacedDate(orderId);
    const orderConfirmedDate = await chainApi.getOrderConfirmedDate(orderId);
    const orderPaidDate = await chainApi.getOrderPaidDate(orderId);

    // get the chain details of the order
    const orderAddress = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM orders WHERE orderId = ?`, [orderId], (err, row) => {
        if (err) {
          reject(err);
        }
        resolve(row.orderAddress);
      });
    });
    const orderProduct = await chainApi.getOrderProduct(orderId);
    const details = {
      orderBuyer: buyer,
      orderBuyerAddress: await chainApi.getOrderBuyer(orderId),
      orderQuantity: quantity,
      orderPrice: price,
      orderPlacedDate: orderPlacedDate === null ? 'NA' : orderPlacedDate,
      orderConfirmedDate: orderConfirmedDate === null ? 'NA' : orderConfirmedDate,
      orderPaidDate: orderPaidDate === null ? 'NA' : orderPaidDate,
      orderAddress: orderAddress,
      orderProduct: orderProduct
    }
    RKWriteLog(`[ rk-sellerops ] 📦 Order details of order ${orderId}`, 'rk-sellerops');
    resolve(details);
  });
}
//====================================================================================
// functions related to Shipments from seller page
//====================================================================================
//
// function to get shipments from the shop from shipments table
async function viewShipments(email) {
  const wid = await loggingApi.getWalletId(email);
  let shipments = [];
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM shipments WHERE sellerAddress = ?`, [wid], (err, rows) => {
      if (err) {
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
      RKWriteLog(`[ rk-sellerops ] 🚚 Shipments from seller ${email}`, 'rk-sellerops');
      resolve(shipments);
    });
  });
}

async function ordersToShip(email) {
  const wallets = (await chainApi.getWallets(email)).map(wallet => `'${wallet.wid}'`).join(',');
  let orders = [];
  // get orders from orders table where sellerAddress is in wallets and trnasactionId is not null
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM orders WHERE sellerAddress IN (${wallets}) AND transactionId IS NOT NULL`, async (err, rows) => {
      if (err) {
        reject(err);
      }
      for (const row of rows) {
        const data = {
          orderName: await chainApi.getProductName(row.productId),
          orderId: row.orderId,
          orderPrice: await chainApi.getOrderPrice(row.orderId),
          orderBuyer: row.buyerAddress,
          orderPlacedDate: await chainApi.getOrderPlacedDate(row.orderId),
        }
        orders.push(data);
      }
      RKWriteLog(`[ rk-sellerops ] 🛒 Orders to seller ${email}`, 'rk-sellerops');
      resolve(orders);
    });
  });
}
//====================================================================================
// functions related to Transactions from seller page
//====================================================================================
async function getTransactions(email) {
  const wallets = (await chainApi.getWallets(email)).map(wallet => `'${wallet.wid}'`).join(',');
  let transactions = [];
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM orders WHERE sellerAddress IN (${wallets}) AND transactionId IS NOT NULL`, async (err, rows) => {
      if (err) {
        reject(err);
      }
      for (const row of rows) {
        console.log(row);
        const data = {
          transactionId: row.transactionId,
          transactionFrom: row.buyerAddress,
          transactionTo: row.sellerAddress,
          transactionAmount: await chainApi.getOrderPrice(row.orderId),
          transactionDate: await chainApi.getOrderPaidDate(row.orderId),
        }
        transactions.push(data);
      }
      RKWriteLog(`[ rk-sellerops ] 📈 Transactions to seller ${email}`, 'rk-sellerops');
      resolve(transactions);
    });
  });
}

async function refundAmount(orderId) {
  return new Promise(async (resolve, reject) => {
    // get the order paid date for order
    const orderPaidDate = await chainApi.getOrderPaidDate(orderId);
    // if order is paid then refund the amount
    if (orderPaidDate) {
      const refundAmount = await chainApi.getOrderPrice(orderId);
      const transaction = await chainApi.getOrderTransaction(orderId);
      const sellerWid = transaction.to;
      const buyerWid = transaction.from;
      try {
        let tx = await chainApi.transferFunds(sellerWid, buyerWid, refundAmount);
        await tx.wait();
        RKWriteLog(`[ rk-sellerops ] 💸 Refunded amount for order ${orderId}`, 'rk-sellerops');
        // delete the order from the orders table
        db.run(`DELETE FROM orders WHERE orderId = ?`, [orderId]);
        resolve(tx.hash);
      } catch (error) {
        reject(error);
      }
    }
    else {
      reject('Order not paid');
    }
  });
}

//====================================================================================
//module exports
module.exports = {
  viewShop,
  uploadProduct,
  viewOrders,
  viewOrder,
  viewShipments,
  ordersToShip,
  getTransactions,
  refundAmount
}
