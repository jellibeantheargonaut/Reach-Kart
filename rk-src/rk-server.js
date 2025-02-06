// Javascript file to serve the RK website
const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Importing the required modules
const { createUser, checkLogin, userExists, verifyToken, generateToken } = require('./rk-logging');

// Express js settings
const app = express();
const port = 3000;
//const options = {
//  key: fs.readFileSync(path.join(__dirname, 'data', 'reachkart.key')),
//  cert: fs.readFileSync(path.join(__dirname, 'data', 'reachkart.crt'))
//}
app.use(express.static('public'));
app.use(express.json());

// session settings to be implemented later

// Routes to serve the static pages
//==============================================================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// routes for login and signup
app.post('/login', async (req, res) => {
    const data = req.body;
    // if cookie is present, user is already logged in
    // redirect to home page
    // check if the user exists in the database
    // if yes, generate a jwt token and send it back
    const status = await userExists(data.email);
    if(status){
      const password = data.password;
      const email = data.email;
      if(await checkLogin(email,password)){
        const token = await generateToken(email);
        res.cookie('jwt',token);
        return res.json({token:token});
      }
    }
    else {
      return res.status(401).json({message:'Invalid email or password'});
    }
});
app.post('/signup', async (req, res) => {
    const data = req.body;
    // create a new user
    const status = await userExists(data.email);
    if(status){
      return res.json({message:'User already exists'});
    }
    else {
      createUser(data.email,data.password,data.name);
      return res.json({message:'User created'});
    }
});

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