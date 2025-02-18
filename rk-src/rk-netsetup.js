// java script file to set up the hardhat network
// and deploy the smart contracts
// @author: JellibeanTheArgonaut

// Importing the required modules
const fs = require('fs');
const path = require('path');
const loggingApi = require('./rk-logging');
const usersOps = require('./rk-userops');
const sellerOps = require('./rk-sellerops');
const chainApi = require('./rk-chainapi');


async function setupDatabase(){
    await chainApi.deleteTables();
    await chainApi.createDatabases();
}

// function to generate key and certificate for the website

// Products are read from setup-data/products.json file
// Users and Sellers are read from setup-data/users.json file

// function to create batch of the users and sellers
// @param {string} usersFile - the path to the users.json file
// @param {string} sellersFile - the path to the sellers.json file
async function createBatch(usersFile){
    return new Promise(async (resolve,reject) => {
        const users = JSON.parse(fs.readFileSync(usersFile));
        try {
            for(let i=0;i<users.length;i++){
                const user = users[i];
                const email = user.email;
                const password = user.password;
                const name = user.name;
                const accountType = 'customer';
                await loggingApi.createUser(email,password,name,accountType);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            resolve(true);
        }
        catch(err){
            console.error(err);
            reject(err);
        }
    });
}

// function to create the product smart contracts
// this function uses functions from rk-chainapi.js
// 
// @param {string} productsFile - the path to the products.json file

// function to fund the users and sellers
// this function uses functions from rk-chainapi.js

setupDatabase();
createBatch(path.join(__dirname,'setup-data','users.json'));