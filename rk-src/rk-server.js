// Javascript file to serve the RK website
const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const cookieParser = require('cookie-parser');

// Importing the required modules
const loggingApi = require('./rk-logging');
const userOps = require('./rk-userops');
const sellerOps = require('./rk-sellerops');
const chainApi = require('./rk-chainapi');

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

// session settings to be implemented later


//==============================================================================
// Seller Endpoints and stuff
//==============================================================================

// middleware function to allow only seller accounts
function sellerOnly(req, res, next){
    if(req.cookies.jwt){
      const token = req.cookies.jwt;
      const status = loggingApi.verifyToken(token);
      if(status){
        if(status.account_type === 'seller'){
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
app.get('/seller/home', sellerOnly,(req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/seller/home.html'));
});

//==============================================================================

// routes for functions to seller operations

// these routes are provided by the chain api and the sellerops module

// routes for shop page
//--------------------------------------------------------------------------
// app.get('/seller/availableProducts', sellerOnly,(req, res) => {}
// app.get('/seller/viewProductDetails', sellerOnly,(req, res) => {}
// app.post('/seller/uploadProduct', sellerOnly,(req, res) => {}
// app.post('/seller/updateProduct', sellerOnly,(req, res) => {}
// app.post('/seller/deleteProduct', sellerOnly,(req, res) => {}
// app.post('/seller/shipProduct', sellerOnly,(req, res) => {}

// routes for orders page
//--------------------------------------------------------------------------
// app.get('/seller/viewOrders', sellerOnly,(req, res) => {}
// app.get('/seller/viewOrder/:orderId', sellerOnly,(req, res) => {} 
app.get('/seller/viewOrder/:orderId', sellerOnly, async (req, res) => {
    const orderId = req.params.orderId;
    const orderDetails = {
      email: 'john@gmail.com',
      walletId: '0x1234567890',
      quantity: 1,
      price: 100
    }
    return res.status(200).json(orderDetails);
});

//==============================================================================

// middleware function to allow only logged in users

function loggedIn(req, res, next){
    if(req.cookies.jwt){
      const token = req.cookies.jwt;
      const status = loggingApi.verifyToken(token);
      if(status){
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
app.get('/', loggedIn,(req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});
app.get('/home', loggedIn, async (req, res) => {
  const userDetails = loggingApi.verifyToken(req.cookies.jwt);
  if( userDetails && userDetails.account_type === 'seller'){
    return res.redirect('/seller/home');
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

//================================================
// routes for order related operations
//================================================
// app.post('/user/placeOrder', (req, res) => {}
// app.post('/user/cancelOrder', (req, res) => {}
// app.post('/user/payOrder', (req, res) => {}
// app.post('/user/confirmOrder', (req, res) => {}
// app.post('/user/refundOrder', (req, res) => {}
// app.get('/user/viewOrders', (req, res) => {}
app.get('/users/viewOrders', loggedIn, async (req,res) => {
  const token = await loggingApi.verifyToken(req.cookies.jwt);
  const email = token.email;
  const orders = await userOps.viewOrders(email);
  return res.status(200).json(orders);
})

// app.post('/user/viewOrder', (req, res) => {}
// app.post('/user/getOrderBill', (req, res) => {}
//================================================

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
  if(status){
    const password = data.password;
    const email = data.email;
    const check = await loggingApi.checkLogin(email,password);
    if(check){
      const token = await loggingApi.generateToken(email);
      res.cookie('jwt',token);
      return res.status(200).json({token:token});
    }
    else {
      return res.status(401).json({message:'Invalid password'});
    }
  }
  else {
    return res.status(401).json({message:'User does not exist'});
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
  if(status){
    return res.status(401).json({message:'User already exists'});
  }
  else {
    loggingApi.createUser(data.email,data.password,data.name,data.account_type);
    return res.json({message:'User created'});
  }
});
app.get('/common/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/signup-page.html'));
});


// app.get('/common/logout', (req, res) => {}
app.get('/common/logout', (req, res) => {
  res.clearCookie('jwt');
  return res.status(200).json({message:'Logged out'});
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

// app.get('/common/getAddresses', loggedIn, (req, res) => {}
app.get('/common/getAddresses', loggedIn, async (req,res) => {
  const token = loggingApi.verifyToken(req.cookies.jwt);
  const email = token.email;
  const addresses = await userOps.getAddresses(email);
  return res.status(200).json(addresses);
})

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