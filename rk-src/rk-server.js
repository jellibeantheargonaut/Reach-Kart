// Javascript file to serve the RK website
const express = require('express');
const fs = require('fs');
const path = require('path');

// Express js settings
const app = express();
const port = 3000;
app.use(express.static('public'));

// sessio settings to be implemented later

// Routes to serve the static pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/home.html'));
});


// Start the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});