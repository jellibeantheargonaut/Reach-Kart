// Javascript file to serve the RK website
const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const cookieParser = require('cookie-parser');
const { getWalletBalance } = require('./rk-chainapi');

// Importing the required modules
const { createUser, checkLogin, userExists, verifyToken, generateToken } = require('./rk-logging');
const { log } = require('console');

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

// Routes to serve the static pages
//==============================================================================

// landing pages when logged in
app.get('/', loggedIn,(req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});
app.get('/home', loggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
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

// middleware function to allow only seller accounts
function sellerOnly(req, res, next){
    if(req.cookies.jwt){
      const token = req.cookies.jwt;
      const status = verifyToken(token);
      if(status){
        if(token.account_type === 'seller'){
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
app.get('/seller/home', sellerOnly,(req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/seller.html'));
});

app.get('/seller/shop', sellerOnly,(req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/shop.html'));
});

app.get('/seller/orders', sellerOnly,(req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/orders.html'));
});

//==============================================================================

// routes for functions to seller operations

// these routes are provided by the chain api
// app.post('/seller/uploadProduct', sellerOnly,(req, res) => {}
// app.post('/seller/updateProduct', sellerOnly,(req, res) => {}
// app.post('/seller/deleteProduct', sellerOnly,(req, res) => {}
// app.post('/seller/shipProduct', sellerOnly,(req, res) => {}
// app.post('/seller/sendRefund', sellerOnly,(req, res) => {}


//==============================================================================

// middleware function to allow only logged in users

function loggedIn(req, res, next){
    if(req.cookies.jwt){
      const token = req.cookies.jwt;
      const status = verifyToken(token);
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

// routes for user account static pages
//==============================================================================
app.get('/', loggedIn,(req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});
app.get('/home', loggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
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
// app.post('/user/placeOrder', (req, res) => {}
// app.post('/user/cancelOrder', (req, res) => {}
// app.post('/user/payOrder', (req, res) => {}
// app.post('/user/confirmOrder', (req, res) => {}
// app.post('/user/refundOrder', (req, res) => {}
// app.post('/user/viewOrders', (req, res) => {}
// app.post('/user/viewOrder', (req, res) => {}
// app.post('/user/getOrderBill', (req, res) => {}

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
  const status = await userExists(data.email);
  if(status){
    const password = data.password;
    const email = data.email;
    const check = await checkLogin(email,password);
    if(check){
      const token = await generateToken(email);
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
  const status = await userExists(data.email);
  if(status){
    return res.status(401).json({message:'User already exists'});
  }
  else {
    createUser(data.email,data.password,data.name,data.account_type);
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
app.get('/common/getUserDetails', loggedIn, (req, res) => {
  const token = req.cookies.jwt;
  const userDetails = verifyToken(token);
  if (userDetails) {
    const details = {
      name: userDetails.name,
      email: userDetails.email,
      account_type: userDetails.account_type,
      walletId: userDetails.walletId
    };
    return res.status(200).json(details);
  } else {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// app.post('/common/getWallets', (req, res) => {}
// app.post('/common/getWalletBalance', (req, res) => {}
app.get('/common/getWalletBalance', loggedIn, async (req, res) => {
  const token = req.cookies.jwt;
  const userDetails = verifyToken(token);
  if (userDetails) {
    const balance = await getWalletBalance(userDetails.walletId);
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
  console.log(`🚀 RK server listening at http://localhost:${port}`);
});
// Start the server
// deployment code for production
//https.createServer(options,app).listen(port, () => {
//  console.log(`✅ RK server listening at https://localhost:${port}`);
//});