// javascript file for handling logging and signup
// routes

// Importing the required modules
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { ethers } = require('hardhat');
const crypto = require('crypto');
const { resolve } = require('path');

// connecting to the sqlite3 database
let db = new sqlite3.Database('./data/reachkart.db', (err) => {
    if(err){
        console.error(err.message);
    }
    console.log('[ rk-logging ] ✅ Connected to the rk database');
});

// secret key for signing jwt tokens
const SECRET_KEY = process.env.SECRET_KEY || 'SuperSecretPassword';

// create a new user
// this function is called when a new user signs up
function createUser(email,password,name,accountType){
    return new Promise((resolve,reject) => {
        const wallet = ethers.Wallet.createRandom();
        const wid = wallet.address;
        const pk = wallet.privateKey;
        // join this wallet to reachkart hardhat network
        //const provider = new ethers.JsonRpcProvider('http://localhost:8545');
        //wid.connect(provider);
        
        // hash the password using SHA256
        const passHash = crypto.createHash('sha256').update(password).digest('hex');
        db.run(`INSERT INTO users(wid,pk,email,password,name,created_at,account_type) VALUES(?,?,?,?,?,?,?)`,[wid,pk,email,passHash,name,Date.now(),accountType], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            console.log(`[ rk-logging ] 👤 User ${name} created with wallet id ${wid}`);
        });
        // also add entry in wallets table
        db.run(`INSERT INTO wallets(wid,pk,email) VALUES(?,?,?)`,[wid,pk,email], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            console.log(`[ rk-logging ] 👤 Wallet ${wid} created for user ${name}`);
        });
        resolve(true);
    });
}

// function to delete a user
async function deleteUser(email){
    return new Promise((resolve,reject) => {
        db.run(`DELETE FROM users WHERE email = ?`,[email], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            console.log(`[ rk-logging ] 👤 User with email ${email} deleted`);
            resolve(true);
        });
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
                const payload = {
                    name: row.name,
                    email: row.email,
                    account_type: row.account_type,
                    walletId: row.wid,
                    pkey: row.pk
                };
                const options = {
                    expiresIn: '1d'
                };
                console.log(`[ rk-logging ] 🔑 Generating token for user with email ${email}`);
                return resolve(jwt.sign(payload,SECRET_KEY,options));
            }
            else {
                console.log(`[ rk-logging ] 🤕 User with email ${email} not found`);
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
        console.log(`[ rk-logging ] 🔍 Checking login for user with email ${email}`);
        //console.log(`🔍 Password hash is ${passHash}`);
        db.get(`SELECT * FROM users WHERE email = ?`,[email], (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            if(row){
                if(passHash === row.password){
                    console.log(`[rk-logging ] 👤 User ${row.name} logged in with wallet id ${row.wid}`);
                    return resolve(true);
                }
                else {
                    console.log(`[ rk-logging ] ❌ Password mismatch for user with email ${email}`);
                    return resolve(false);
                }
            }
            console.log(`[ rk-logging ] ❌ User with email ${email} not found`);
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
    deleteUser,
    generateToken,
    verifyToken,
    checkLogin,
    userExists,
    getWalletId
};