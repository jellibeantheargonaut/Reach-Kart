// javascript file for handling logging and signup
// routes

// Importing the required modules
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { ethers } = require('hardhat');
const crypto = require('crypto');
const { resolve } = require('path');
const { RKWriteLog } = require('./rk-logs');

// connecting to the sqlite3 database
let db = new sqlite3.Database('./data/reachkart.db', (err) => {
    if(err){
        console.error(err.message);
    }
    RKWriteLog('[ rk-logging ] ✅ Connected to the rk database','rk-logging');
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
            RKWriteLog(`[ rk-logging ] 👤 User ${name} created with wallet id ${wid}`, 'rk-logging');
        });
        // also add entry in wallets table
        db.run(`INSERT INTO wallets(wid,pk,email) VALUES(?,?,?)`,[wid,pk,email], (err) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            RKWriteLog(`[ rk-logging ] 👤 Wallet ${wid} created for user ${name}`, 'rk-logging');
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
            RKWriteLog(`[ rk-logging ] 👤 User with email ${email} deleted`, 'rk-logging');
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
                RKWriteLog(`[ rk-logging ] 🔑 Generating token for user with email ${email}`, 'rk-logging');
                return resolve(jwt.sign(payload,SECRET_KEY,options));
            }
            else {
                RKWriteLog(`[ rk-logging ] 🤕 User with email ${email} not found`, 'rk-logging');
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
        RKWriteLog(`[ rk-logging ] 🔍 Checking login for user with email ${email}`, 'rk-logging');
        db.get(`SELECT * FROM users WHERE email = ?`,[email], (err,row) => {
            if(err){
                console.error(err.message);
                reject(err);
            }
            if(row){
                if(passHash === row.password){
                    RKWriteLog(`[rk-logging ] 👤 User ${row.name} logged in with wallet id ${row.wid}`, 'rk-logging');
                    return resolve(true);
                }
                else {
                    RKWriteLog(`[ rk-logging ] ❌ Password mismatch for user with email ${email}`, 'rk-logging');
                    return resolve(false);
                }
            }
            RKWriteLog(`[ rk-logging ] ❌ User with email ${email} not found`, 'rk-logging');
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

function getEmail(wid){
    return new Promise((resolve,reject) => {
        db.get(`SELECT * FROM wallets WHERE wid = ?`,[wid], (err,row) => {
            if(err){
                reject(err);
            }
            if(row){
                resolve(row.email);
            }
            resolve(null);
        });
    });
}

function getAddress(addressId){
    return new Promise((resolve,reject) => {
        db.get(`SELECT addressValue FROM addresses WHERE addressId = ?`,[addressId], (err,row) => {
            if(err){
                RKWriteLog(`[ rk-logging ] ❌ Error getting address with id ${addressId}`, 'rk-logging');
                reject(err);
            }
            if(row){
                resolve(row.addressValue);
            }
            resolve(null);
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
    getWalletId,
    getEmail,
    getAddress
};
