// file to setup the server databases

// Importing the required modules
const loggingApi = require('./rk-logging');
const chainApi = require('./rk-chainapi');
const fs = require('fs');
const path = require('path');

// setting up the server databases for user accounts

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// creating the user accounts
async function createUserAccounts(accountType) {
    return new Promise((resolve, reject) => {
        const data = fs.readFileSync('./setup-data/users.json');
        const users = JSON.parse(data);
        for(let user of users) {
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

// fund the accounts
async function fundWallets() {
    return new Promise(async (resolve, reject) => {
        const data = fs.readFileSync('./setup-data/users.json');
        const users = JSON.parse(data);
        for(let user of users) {
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
            await loggingApi.createUser('penguin@gmail.com',"cosmos1234","Penguin Random House","seller");
            const wallet = await loggingApi.getWalletId('penguin@gmail.com');
            await chainApi.fundWallet(wallet, '2000000');

            // Use a `for...of` loop to handle async/await properly
            for (let product of products) {
                try {
                        const payload = {
                            productName : product.productName,
                            productDescription: product.productDescription,
                            productImage: product.productImage,
                            productPrice: product.productPrice.toString(),
                            productQuantity: product.productStock.toString(),
                            walletId: wallet
                        }
                        const response = await fetch('http://localhost:3000/seller/uploadProduct',{
                            method: 'POST',
                            headers : {
                                'Content-Type': 'application/json',
                                'Cookie': 'jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiUGVuZ3VpbiBSYW5kb20gSG91c2UiLCJlbWFpbCI6InBlbmd1aW5AZ21haWwuY29tIiwiYWNjb3VudF90eXBlIjoic2VsbGVyIiwid2FsbGV0SWQiOiIweDBmMDBjNjJhNjgyQzEwMjY2QmQzYWFmMjBkNTBCMzUwODg3NEY1OTYiLCJwa2V5IjoiMHgzNDhjNDZhZWVkYmJjNjdiMjhhODlkYmM3MTRiMGUxZDhkN2YzZWZlOGViYmM3MGYzODE0ZDg2MmI3OWE1ODUyIiwiaWF0IjoxNzQzMjMwNDU3LCJleHAiOjE3NDMzMTY4NTd9.HehawioZ-mstQp1VA9-TqbE3CpyZWHThxcjVXtdcc2M'

                            },
                            body : JSON.stringify(payload)
                        });
                        await delay(4000)
                        if(response.status == 200){
                            console.log(`Product ${product.productName} Uploaded`);
                        } else {
                            console.log(`Error uploading ${product.productName}`)
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


// main function to setup the server databases
async function setupServerDatabases() {
    await createUserAccounts();
    await fundWallets();
}

if( require.main === module ) {
    setupServerDatabases().then(() => {
        console.log('🚀 Server databases setup complete');
    }).catch((err) => {
        console.log('❌ Error setting up server databases');
        console.log(err);
    });

    batchCreateProducts(path.join(__dirname, "setup-data","books.json")).then(() => {
        console.log("Products to the shop added");
    }).catch((err) => {
        console.log("Something Fuzzed up");
        console.log(err);
    })
}
