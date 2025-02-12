// file to setup the server databases

// Importing the required modules
const { createUser } = require('./rk-logging');
const fs = require('fs');

// setting up the server databases for user accounts
const data = fs.readFileSync('./setup-data/users.json');
const users = JSON.parse(data);
users.forEach(user => {
    createUser(user.email, user.password, user.name, user.accountType);
    console.log(`✅ User ${user.name} created`);
});