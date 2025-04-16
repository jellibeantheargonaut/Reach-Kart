// file to setup the server databases

// Importing the required modules
import loggingApi from './rk-logging.js';
import chainApi from './rk-chainapi.js';
import userOps from './rk-userops.js';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // Ensure `node-fetch` is installed

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Creating the user accounts
async function createUserAccounts(accountType) {
    return new Promise((resolve, reject) => {
        const data = fs.readFileSync('./setup-data/users.json');
        const users = JSON.parse(data);
        for (let user of users) {
            loggingApi.createUser(
                user.email,
                user.password,
                user.name,
                "customer"
            ).then(() => {
                console.log(`👤 User ${user.email} created`);
            }).catch((err) => {
                console.log(`❌ Error creating user ${user.email}`);
                console.log(err);
                reject(err);
            });
        }
        resolve();
    });
}

// Fund the accounts
async function fundWallets() {
    return new Promise(async (resolve, reject) => {
        const data = fs.readFileSync('./setup-data/users.json');
        const users = JSON.parse(data);
        for (let user of users) {
            let wallets = await chainApi.getWallets(user.email);
            chainApi.fundWallet(wallets[0].wid, '1000');
        }
        resolve();
    });
}

async function batchCreateProducts(productsFile) {
    return new Promise(async (resolve, reject) => {
        try {
            const products = JSON.parse(fs.readFileSync(productsFile));
            await loggingApi.createUser('penguin@gmail.com', "cosmos1234", "Penguin Random House", "seller");
            const wallet = await loggingApi.getWalletId('penguin@gmail.com');
            await chainApi.fundWallet(wallet, '2000000');

            const token = await loggingApi.generateToken('penguin@gmail.com');

            // Use a `for...of` loop to handle async/await properly
            for (let product of products) {
                try {
                    const payload = {
                        productName: product.productName,
                        productDescription: product.productDescription,
                        productImage: product.productImage,
                        productPrice: product.productPrice.toString(),
                        productQuantity: product.productStock.toString(),
                        walletId: wallet
                    };
                    const response = await fetch('http://localhost:3000/seller/uploadProduct', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Cookie': `jwt=${token}`
                        },
                        body: JSON.stringify(payload)
                    });
                    await delay(1000);
                    if (response.status === 200) {
                        console.log(`Product ${product.productName} Uploaded`);
                    } else {
                        console.log(`Error uploading ${product.productName}`);
                    }
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

// Main function to setup the server databases
async function setupServerDatabases() {
    await chainApi.deleteTables();
    await delay(3000);

    await chainApi.createDatabases();
    await delay(3000);

    await chainApi.resetMeiliSearch();
    await delay(3000);

    await userOps.clearRedis();

    await createUserAccounts();
    await delay(3000);

    await fundWallets();
}

if (import.meta.url === `file://${process.argv[1]}`) {
    await setupServerDatabases().then(() => {
        console.log('🚀 Server databases setup complete');
    }).catch((err) => {
        console.log('❌ Error setting up server databases');
        console.log(err);
    });

    await delay(3000);

    await batchCreateProducts("/Users/Jellibean/Documents/Github/Reach-Kart/rk-src/setup-data/books.json").then(() => {
        console.log("Products to the shop added");
    }).catch((err) => {
        console.log("Something Fuzzed up");
        console.log(err);
    });
}
