// javascript file for handling logging and signup
// routes

// Importing the required modules
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { ethers } = require('hardhat');
const crypto = require('crypto');
const { resolve } = require('path');

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

// secret key for signing jwt tokens
const SECRET_KEY = process.env.SECRET_KEY || 'SuperSecretPassword';

// create the users table if not exists

db.run(` CREATE TABLE IF NOT EXISTS users (
    wid string PRIMARY KEY,
    pk string NOT NULL,
    email string NOT NULL,
    password string NOT NULL,
    name string NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_type string DEFAULT 'user' NOT NULL)`
);

// create a new user
// this function is called when a new user signs up
function createUser(email,password,name,accountType){
    const wallet = ethers.Wallet.createRandom();
    const wid = wallet.address;
    const pk = wallet.privateKey;
    // join this wallet to reachkart hardhat network
    //const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    //wid.connect(provider);

    // hash the password using SHA256
    const passHash = crypto.createHash('sha256').update(password).digest('hex');
    db.run(`INSERT INTO users(wid,pk,email,password,name,account_type) VALUES(?,?,?,?,?,?)`,[wid,pk,email,passHash,name,accountType], (err) => {
        if(err){
            console.error(err.message);
        }
        console.log(`✅ User ${name} created with wallet id ${wid}`);
    });
}

// function to generate a jwt token
// this function is called when a user logs in
async function generateToken(email){
    return new Promise((resolve,reject) => {
        db.get(`SELECT * FROM users WHERE email = ?`,[email], (err,row) => {
            if(err){
                console.error(err.message);
            }
            if(row){
                const walletId = row.wid;
                const email = row.email;
                const payload = {
                    email: email,
                    accountType: row.account_type,
                    walletId: walletId,
                    pkey: row.pk
                };
                const options = {
                    expiresIn: '1d'
                };
                console.log(`🔑 Generating token for user with email ${email}`);
                return resolve(jwt.sign(payload,SECRET_KEY,options));
            }
            else {
                console.log(`🤕 User with email ${email} not found`);
                return reject('User not found');
            }
        });
    });
}
// function to verify a jwt token
function verifyToken(token){
    return jwt.verify(token,SECRET_KEY);
}

// login function
// this function is called when a user logs in
// returns true if the user is authenticated
function checkLogin(email,password) {
    return new Promise((resolve,reject) => {
        const passHash = crypto.createHash('sha256').update(password).digest('hex');
        console.log(`🔍 Checking login for user with email ${email}`);
        //console.log(`🔍 Password hash is ${passHash}`);
        db.get(`SELECT * FROM users WHERE email = ?`,[email], (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            if(row){
                if(passHash === row.password){
                    console.log(`✅ User ${row.name} logged in with wallet id ${row.wid}`);
                    return resolve(true);
                }
                else {
                    console.log(`❌ Password mismatch for user with email ${email}`);
                    return resolve(false);
                }
            }
            console.log(`❌ User with email ${email} not found`);
            return resolve(false);
        });
    });
}

//==============================================================================
// utility functions
function userExists(email){
    return new Promise((resolve,reject) => {
        db.get(`SELECT * FROM users WHERE email = ?`,[email], (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            if(row){
                return resolve(true);
            }
            return resolve(false);
        });
    });
}

function getWalletId(email){
    return new Promise((resolve,reject) => {
        db.get(`SELECT * FROM users WHERE email = ?`,[email], (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            if(row){
                return resolve(row.wid);
            }
            return resolve(null);
        });
    });
}

module.exports = {
    createUser,
    generateToken,
    verifyToken,
    checkLogin,
    userExists,
    getWalletId
};