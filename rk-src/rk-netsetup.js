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
    return new Promise(async (resolve,reject) => 
    {
        await chainApi.deleteTables();
        await chainApi.createDatabases();
        resolve();
    });
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

async function batchCreateProducts(productsFile) {
    return new Promise(async (resolve, reject) => {
        try {
            const products = JSON.parse(fs.readFileSync(productsFile));
            await loggingApi.createUser('penguin@gmail.com',"cosmos1234","Penguin Random House","seller");
            const wallet = await loggingApi.getWalletId('penguin@gmail.com');
            await chainApi.fundWallet(wallet, '2000000');

            // Use a `for...of` loop to handle async/await properly
            for (const product of products) {
                try {
                    await chainApi.deployProductContract(
                        'penguin@gmail.com',
                        wallet,
                        product.productName,
                        product.productDescription,
                        product.productImage,
                        product.productPriceETH,
                        product.productStock,
                        product.tags
                    );
                } catch (err) {
                    console.error(`Error deploying contract for product: ${product.productName}`, err);
                }
            }

            resolve();
        } catch (err) {
            console.error('Error in batchCreateProducts:', err);
            reject(err);
        }
    });
}
await batchCreateProducts(path.join(__dirname, 'setup-data','books.json'));