// javascript file for handling logging and signup
// routes

// Importing the required modules
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');

// setting up sqlite3 database
// create new if not exists
if(!fs.existsSync('./data/reachkart.db')){
    fs.openSync('./data/reachkart.db', 'w');
}
let db = new sqlite3.Database('./data/reachkart.db', (err) => {
    if(err){
        console.error(err.message);
    }
    console.log('✅ Connected to the rk database');
});
// create the users table if not exists

// function to create a new user

// function to login a user

// token verification function