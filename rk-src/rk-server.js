// Javascript file to serve the RK website
const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Express js settings
const app = express();
const port = 3000;
//const options = {
//  key: fs.readFileSync(path.join(__dirname, 'data', 'reachkart.key')),
//  cert: fs.readFileSync(path.join(__dirname, 'data', 'reachkart.crt'))
//}
app.use(express.static('public'));

// sessio settings to be implemented later

// Routes to serve the static pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/home.html'));
});


// start the server
app.listen(port, () => {
  console.log(`✅ RK server listening at http://localhost:${port}`);
});
// Start the server
// deployment code for production
//https.createServer(options,app).listen(port, () => {
//  console.log(`✅ RK server listening at https://localhost:${port}`);
//});