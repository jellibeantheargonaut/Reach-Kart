// Javascript file to serve the RK website
const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const cookieParser = require('cookie-parser');
const Tail = require('tail').Tail;
const morgan = require('morgan');
const WebSocket = require('ws');
const { exec } = require('child_process');

const { RKLogInit } = require('./rk-logs');
RKLogInit();

// Importing the required modules
const loggingApi = require('./rk-logging');
const userOps = require('./rk-userops');
const sellerOps = require('./rk-sellerops');
const chainApi = require('./rk-chainapi');

// clear the redis cache before starting
userOps.clearRedis();
console.log('🧹 Redis Cache Cleared');

// Express js settings
const app = express();
const port = 3000;
//const options = {
//  key: fs.readFileSync(path.join(__dirname, 'data', 'reachkart.key')),
//  cert: fs.readFileSync(path.join(__dirname, 'data', 'reachkart.crt'))
//}
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// Middleware to log requests using morgan
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// creating the websocket server
const wsServer = new WebSocket.Server({ port: 8888 });
wsServer.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(`[ rk-admin ] 🚀 Received message => ${message}`);

    // execute the command and send the output to the client
    exec(message, (error, stdout, stderr) => {
      if (error) {
        ws.send(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        ws.send(`Error: ${stderr}`);
        return;
      }
      ws.send(stdout);
    });
  });

  ws.on('close', () => {
    console.log('[ rk-admin ] 🚀 WebSocket Connection closed');
  });
});


//==============================================================================
// Meilisearch engine endpoints
//==============================================================================
const { Meilisearch } = require('meilisearch');
const meili = new Meilisearch({
  host: "http://localhost:7700",
  apiKey: "SuperSecretPasswordForMeilisearch"
});

//endpoint to get the documents
app.post('/search', async (req, res) => {
  const searchString = req.body.search;
  try {
    const searchResutls = await meili.index('products').search(searchString, {
      attributesToHighlight: ['productName', 'productDescription', 'tags']
    });

    return res.status(200).json(searchResutls.hits);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something Fumbled" });
  }
})

//==============================================================================

//==============================================================================
// Endpoints and function to deal with admins only
//==============================================================================
function adminOnly(req, res, next) {
  if (req.cookies.jwt) {
    const token = req.cookies.jwt;
    const status = loggingApi.verifyToken(token);
    if (status) {
      if (status.account_type === 'admin') {
        next();
      }
      else {
        res.status(403).send('Forbidden');
      }
    }
    else {
      res.status(403).send('Forbidden');
    }
  }
  else {
    res.redirect('/');
  }
}

app.get('/admin', adminOnly, (req, res) => {
  res.redirect('/admin/home');
});
// app.get('/admin/home', adminOnly, (req,res) => {})
app.get('/admin/home', adminOnly, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/admin/home.html'));
});
// app.get('/logs/:module', adminOnly, (req,res) => {})
app.get('/logs/:module', adminOnly, async (req, res) => {
  const module = req.params.module;
  const logFile = path.join(__dirname, 'logs', `${module}.log`);

  // set headers for Server Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // create a read stream for the log file
  //const stream = fs.createReadStream(logFile);

  //stream.on('data', (chunk) => {
  //  res.write(`data: ${chunk.toString()}\n\n`);
  //});
  //stream.on('error', (err) => {
  //  res.status(500).send('Error reading log file');
  //});

  const tail = new Tail(logFile);
  tail.on('line', (data) => {
    res.write(`data: ${data}\n\n`);
  });
  tail.on('error', (error) => {
    res.status(500).send('Error reading log file');
  });
});




//==============================================================================
// Seller Endpoints and stuff
//==============================================================================

// middleware function to allow only seller accounts
function sellerOnly(req, res, next) {
  if (req.cookies.jwt) {
    const token = req.cookies.jwt;
    const status = loggingApi.verifyToken(token);
    if (status) {
      if (status.account_type === 'seller') {
        next();
      }
      else {
        res.status(403).send('Forbidden');
      }
    }
    else {
      res.status(403).send('Forbidden');
    }
  }
  else {
    res.redirect('/');
  }
}
// routes for seller accounts
// main page
app.get('/seller/home', sellerOnly, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/seller/home.html'));
});

//==============================================================================

// routes for functions to seller operations

// these routes are provided by the chain api and the sellerops module

// routes for shop page
//--------------------------------------------------------------------------
// app.get('/seller/availableProducts', sellerOnly,(req, res) => {}
app.get('/seller/availableProducts', sellerOnly, async (req, res) => {
  const token = req.cookies.jwt;
  const email = loggingApi.verifyToken(token).email;
  try {
    const products = await sellerOps.viewShop(email);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching products' });
  }
});

// app.get('/seller/viewProductDetails', sellerOnly,(req, res) => {}

// app.post('/seller/uploadProduct', sellerOnly,(req, res) => {}
app.post('/seller/uploadProduct', sellerOnly, async (req, res) => {
  const token = req.cookies.jwt;
  const email = loggingApi.verifyToken(token).email;
  const data = req.body;
  try {
    const pId = await sellerOps.uploadProduct(email, data.walletId, data.productName, data.productDescription, data.productImage, data.productPrice, data.productQuantity);
    return res.status(200).json({ message: `Product ${pId} uploaded to shop` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error uploading product' });
  }
});

// app.post('/seller/updateProduct', sellerOnly,(req, res) => {}
// app.post('/seller/deleteProduct', sellerOnly,(req, res) => {}
// app.post('/seller/shipProduct', sellerOnly,(req, res) => {}

// routes for orders page
//--------------------------------------------------------------------------
// app.get('/seller/viewOrders', sellerOnly,(req, res) => {}
app.get('/seller/viewOrders', sellerOnly, async (req, res) => {
  const token = req.cookies.jwt;
  const email = loggingApi.verifyToken(token).email;
  try {
    const orders = await sellerOps.viewOrders(email);
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching orders' });
  }
});

// app.get('/seller/viewOrder/:orderId', sellerOnly,(req, res) => {} 
app.get('/seller/viewOrder/:orderId', sellerOnly, async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const order = await sellerOps.viewOrder(orderId);
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching order' });
  }
});

//==============================================================================
// routes for shipments
//==============================================================================
// app.post('/seller/shipOrder', sellerOnly,(req, res) => {}
// app.post('/seller/pendingShipments', sellerOnly,(req, res) => {}
app.get('/seller/pendingShipments', sellerOnly, async (req, res) => {
  const token = req.cookies.jwt;
  const email = loggingApi.verifyToken(token).email;
  try {
    const shipments = await sellerOps.ordersToShip(email);
    return res.status(200).json(shipments);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching shipments' });
  }
});

//==============================================================================

// middleware function to allow only logged in users

function loggedIn(req, res, next) {
  if (req.cookies.jwt) {
    const token = req.cookies.jwt;
    const status = loggingApi.verifyToken(token);
    if (status) {
      next();
    }
    else {
      res.redirect('/common/signin');
    }
  }
  else {
    res.redirect('/common/signin');
  }
}

// Route for product search endopoint
//==============================================================================
// app.get('/search', loggedIn, async (req, res) => {}

// routes for user account static pages
//==============================================================================
app.get('/', loggedIn, (req, res) => {
  res.redirect('/home');
});
app.get('/home', loggedIn, async (req, res) => {
  const userDetails = loggingApi.verifyToken(req.cookies.jwt);
  if (userDetails && userDetails.account_type === 'seller') {
    return res.redirect('/seller/home');
  }
  else if (userDetails && userDetails.account_type === 'admin') {
    return res.redirect('/admin/home');
  }
  else {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
  }
});

// account profile pages for users
app.get('/profile', loggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/profile.html'));
});

// order confirmation page
app.get('/order', loggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/order.html'));
});

//==============================================================================

// routes for functions to user operations

// these routes are provided by the chain api
// app.post('/user/getProduct', (req, res) => {}
app.get('/product/:productId', async (req, res) => {
  const product = req.params.productId;
  try {
    const result = await meili.index('products').getDocument(product);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something Fumbled" });
  }
});

//================================================
// routes for order related operations
//================================================
// app.post('/user/placeOrder', (req, res) => {}
app.post('/user/placeOrder', async (req, res) => {
  const details = req.body
  const token = loggingApi.verifyToken(req.cookies.jwt);

  // all the paramters required for placeOrder function
  const email = token.email;
  const walletId = details.walletId;
  const addressId = details.addressId;
  const qty = details.quantity;
  const product = details.productId;

  // call the function
  try {
    const response = await userOps.placeOrder(walletId, product, qty, addressId);
    return res.status(200).json({ message: "Order Placed" });
  } catch (err) {
    return res.status(500).json({ message: "Order Failed " });
  }
});


// app.post('/user/cancelOrder', (req, res) => {}
// app.post('/user/payOrder', (req, res) => {}
// app.post('/user/confirmOrder', (req, res) => {}
// app.post('/user/refundOrder', (req, res) => {}


// app.get('/user/viewOrders', (req, res) => {}
app.get('/user/viewOrders', loggedIn, async (req, res) => {
  const token = loggingApi.verifyToken(req.cookies.jwt);
  const email = token.email;
  const orders = await userOps.viewOrders(email);
  return res.status(200).json(orders);
});

app.get('/user/viewOrder/:id', loggedIn, async (req, res) => {

  const orderId = req.params.id;

  // order data
  try {
    const data = {
      orderId: orderId,
      orderSeller: await chainApi.getOrderSeller(orderId),
      orderBuyer: await chainApi.getOrderBuyer(orderId),
      orderQuantity: await chainApi.getOrderQuantity(orderId),
      orderPrice: await chainApi.getOrderPrice(orderId)
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500);
  }
});

// app.post('/user/viewOrder', (req, res) => {}
// app.post('/user/getOrderBill', (req, res) => {}
app.get('/user/getOrderBill', loggedIn, async (req, res) => {
  const token = loggingApi.verifyToken(req.cookies.jwt);
  const email = token.email;
  const template = req.query.template;

  // get the template
  const templatePath = path.join(__dirname, 'public', 'templates', `${template}`);
  try {
    const templateFile = fs.readFileSync(templatePath, 'utf-8');
    return res.status(200).send(templateFile);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching template' });
  }
});


//================================================
// routes for transaction related operations
//================================================
// app.get('/user/getTransactions', loggedIn, (req, res) => {}

// app.get('/user/getTransactionDetails', loggedIn, (req, res) => {}
// app.post('/user/transferMoney', loggedIn, (req, res) => {}

//================================================
// routes for address related operations
//================================================
// app.post('/user/addAddress', loggedIn, (req, res) => {}
app.post('/user/addAddress', loggedIn, async (req, res) => {
  const token = loggingApi.verifyToken(req.cookies.jwt);
  const email = token.email;
  const data = req.body;
  try {
    await userOps.addAddress(email, data.address);
    return res.status(200).json({ message: 'Address added' });
  } catch (error) {
    return res.status(500).json({ message: 'Error adding address' });
  }
});

// app.post('/user/updateAddress', loggedIn, (req, res) => {}
app.post('/user/updateAddress', loggedIn, async (req, res) => {
  const token = loggingApi.verifyToken(req.cookies.jwt);
  const email = token.email;
  const data = req.body;
  try {
    await userOps.updateAddress(email, data.address);
    return res.status(200).json({ message: 'Address updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating address' });
  }
});

// app.get('/user/getAddresses', loggedIn, (req, res) => {}
app.get('/user/getAddresses', loggedIn, async (req, res) => {
  const token = loggingApi.verifyToken(req.cookies.jwt);
  const email = token.email;
  const addresses = await userOps.getAddresses(email);
  return res.status(200).json(addresses);
});

// app.post('/user/deleteAddress', loggedIn, (req, res) => {}
// app.post('/user/setDefaultAddress', loggedIn, (req, res) => {}

//================================================
// routes for wallet related operations
//================================================
// app.get('/user/getWalletBalance', loggedIn, (req, res) => {}
// app.get('/user/getWallets', loggedIn, (req, res) => {}
app.get('/user/getWallets', loggedIn, async (req, res) => {
  const token = req.cookies.jwt;
  const email = loggingApi.verifyToken(token).email;
  try {
    const wallets = await userOps.getWallets(email);
    res.status(200).json(wallets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wallets' });
  }
});

// app.post('/user/createWallet', loggedIn, (req, res) => {}
app.post('/user/createWallet', loggedIn, async (req, res) => {
  const token = req.cookies.jwt;
  const email = loggingApi.verifyToken(token).email;
  try {
    const wallet = await chainApi.createWallet(email);
    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ message: 'Error creating wallet' });
  }
});

// app.post('/user/setDefaultWallet', loggedIn, (req, res) => {}
app.post('/user/setDefaultWallet', loggedIn, async (req, res) => {
  const token = req.cookies.jwt;
  const email = loggingApi.verifyToken(token).email;
  const walletId = req.body.walletId;
  try {
    await chainApi.setPrimaryWallet(email, walletId);
    res.status(200).json({ message: 'Default wallet set' });
  } catch (error) {
    res.status(500).json({ message: 'Error setting default wallet' });
  }
});

// app.post('/user/deleteWallet', loggedIn, (req, res) => {}
app.post('/user/deleteWallet', loggedIn, async (req, res) => {
  const token = req.cookies.jwt;
  const email = loggingApi.verifyToken(token).email;
  const walletId = req.body.walletId;
  try {
    await chainApi.deleteWallet(walletId);
    res.status(200).json({ message: 'Wallet deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting wallet' });
  }
});

//================================================
// routes for cart handling 
//================================================
// needs a cache to store the cart items
// availble caching is redis
// app.post('/user/addToCart', loggedIn, (req, res) => {}
app.post('/user/addToCart/:id', loggedIn, async (req, res) => {
  const token = req.cookies.jwt;
  const email = loggingApi.verifyToken(token).email;
  const productId = req.params.id;
  try {
    await userOps.addToCart(email, productId, 1);
    res.status(200).json({ message: 'Product added to cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding product to cart' });
  }
});

// app.post('/user/removeFromCart/:id', loggedIn, (req, res) => {}
app.post('/user/removeFromCart/:id', loggedIn, async (req, res) => {
  const token = req.cookies.jwt;
  const email = loggingApi.verifyToken(token).email;
  const productId = req.params.id;
  try {
    await userOps.removeFromCart(email, productId);
    res.status(200).json({ message: 'Product removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing product from cart' });
  }
});

// app.get('/user/viewCart', loggedIn, (req, res) => {}
app.get('/user/viewCart', loggedIn, async (req, res) => {
  const token = req.cookies.jwt;
  const email = loggingApi.verifyToken(token).email;
  try {
    const cart = await userOps.viewCart(email);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart' });
  }

  // checkout the cart
  app.get('/user/checkoutCart', loggedIn, async (req, res) => {
    const email = loggingApi.verifyToken(req.cookies.jwt).email;
    const wid = req.body.wid;
    const status = await userOps.checkoutCart(email, wid);
    if (status) {
      return res.status(200).json({ message: "Cart Checked Out" });
    } else {
      return res.status(500).json({ message: "Something flipped" });
    }
  });

  //const details = [
  //  {
  //    productId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  //    productName: 'Product 1',
  //    productPrice: 100,
  //    productQuantity: 2,
  //  },
  //  {
  //    productId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  //    productName: 'Product 2',
  //    productPrice: 200,
  //    productQuantity: 1,
  //  },
  //]
  //res.status(200).json(details);
});

// app.post('/user/emptyCart', loggedIn, (req, res) => {}
app.post('/user/emptyCart', loggedIn, async (req, res) => {
  const token = req.cookies.jwt;
  const email = loggingApi.verifyToken(token).email;
  try {
    await userOps.emptyCart(email);
    res.status(200).json({ message: 'Cart emptied' });
  } catch (error) {
    res.status(500).json({ message: 'Error emptying cart' });
  }
});

// app.post('/user/checkoutCart', loggedIn, (req, res) => {}

//==============================================================================
// User transactions operations
//==============================================================================
// app.get('/user/getTransactions', loggedIn, (req, res) => {}
app.get('/user/getTransactions', loggedIn, async (req, res) => {
  const token = req.cookies.jwt;
  const email = loggingApi.verifyToken(token).email;
  try {
    const transactions = await userOps.getTransactions(email);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// app.post('/user/getTransactionReceipt', loggedIn, (req, res) => {}
app.get('/user/getTransactionReceipt/:txHash', loggedIn, async (req, res) => {
  const token = req.cookies.jwt;
  const email = loggingApi.verifyToken(token).email;
  const transactionId = req.params.txHash;
  try {
    const receipt = await userOps.getTransactionReceipt(transactionId);
    res.status(200).json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching receipt' });
  }
});

//==============================================================================

// routes for operations that are common to both users and sellers

// these routes are provided by the chain api


// app.post('/common/login', (req, res) => {}
app.post('/common/signin', async (req, res) => {
  const data = req.body;
  // if cookie is present, user is already logged in
  // redirect to home page
  // check if the user exists in the database
  // if yes, generate a jwt token and send it back
  const status = await loggingApi.userExists(data.email);
  if (status) {
    const password = data.password;
    const email = data.email;
    const check = await loggingApi.checkLogin(email, password);
    if (check) {
      const token = await loggingApi.generateToken(email);
      res.cookie('jwt', token);
      return res.status(200).json({ token: token });
    }
    else {
      return res.status(401).json({ message: 'Invalid password' });
    }
  }
  else {
    return res.status(401).json({ message: 'User does not exist' });
  }
});
app.get('/common/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/signin-page.html'));
});


// app.post('/common/signup', (req, res) => {}
app.post('/common/signup', async (req, res) => {
  const data = req.body;
  // create a new user
  const status = await loggingApi.userExists(data.email);
  if (status) {
    return res.status(401).json({ message: 'User already exists' });
  }
  else {
    loggingApi.createUser(data.email, data.password, data.name, data.account_type);
    return res.json({ message: 'User created' });
  }
});
app.get('/common/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/signup-page.html'));
});


// app.get('/common/logout', (req, res) => {}
app.get('/common/logout', (req, res) => {
  res.clearCookie('jwt');
  return res.status(200).json({ message: 'Logged out' });
});

// app.get('/common/getUserDetails', loggedIn, (req, res) => {}
app.get('/common/getUserDetails', loggedIn, async (req, res) => {
  const token = req.cookies.jwt;
  const userDetails = loggingApi.verifyToken(token);
  if (userDetails) {
    const details = await userOps.getUserAccountDetails(userDetails.email);
    return res.status(200).json(details);
  } else {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// app.post('/common/getWallets', (req, res) => {}
// app.post('/common/getWalletBalance', (req, res) => {}
app.get('/common/getWalletBalance', loggedIn, async (req, res) => {
  const token = req.cookies.jwt;
  const userDetails = loggingApi.verifyToken(token);
  if (userDetails) {
    const balance = await chainApi.getWalletBalance(userDetails.walletId);
    return res.status(200).json({ balance: balance });
  } else {
    return res.status(401).json({ message: 'Invalid token' });
  }
});
// app.post('/common/getWalletTransactions', (req, res) => {}
// app.post('/common/createWallet', (req, res) => {}

// app.post('/common/getQRCode', (req, res) => {} // function to get qr code for product payment
// app.post('/common/getProductDetails', (req, res) => {} // function to get product details

//
//==============================================================================
// start the server
app.listen(port, () => {
  console.log(`[ rk-server ] 🚀 RK server listening at http://localhost:${port}`);
});
// Start the server
// deployment code for production
//https.createServer(options,app).listen(port, () => {
//  console.log(`✅ RK server listening at https://localhost:${port}`);
//});
