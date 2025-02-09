// javascript file for user operations like buying, viewing products etc.
// what user does after logging in
// viewProducts
// viewOrders
// buyProduct
// cancelOrder
// payForOrder
// trackOrder
// viewBalance
// 
// @author: JellibeanTheArgonaut

const { sqlite3 } = require('sqlite3');
const { ethers } = require('hardhat');
const { getWalletId } = require('./rk-logging');
const { v4: uuid } = require('uuid');

// buyProduct function
async function buyProduct(email,productAddr){
    // connect to provider network
    const providerUrl = 'http://localhost:8545';
    const provider = new ethers.JsonRpcProvider(providerUrl);

    // get the product contract from the address
    const productContract = await ethers.getContractAt('ProductRegistry',productAddr);

    // get the wallet id of the user
    const wid = await getWalletId(email);

    // get the order contract from factory
    let Order = await ethers.getContractFactory('Order');
    const signer = provider.getSigner(wid);
    // deploy a new order contract
    try {
        const orderTime = Date.now();
        const productSeller = await productContract.getProductSeller();
        const orderId = uuid();
        const price = await productContract.getProductPrice();
        // send funds to the order contract
        signer.sendTransaction({
            to: orderContract.address,
            value: price
        });
        const orderContract = await Order.connect(signer).deploy(orderTime,productSeller,wid,orderId,price);
        console.log(`✅ Order Contract deployed at ${orderContract.address}`);
    } catch (error) {
        console.error(error);
    }
}

async function payForOder(email,orderAddr){
    // connect to provider network
    const providerUrl = 'http://localhost:8545';
    const provider = new ethers.JsonRpcProvider(providerUrl);

    // get the order contract from the address
    const orderContract = await ethers.getContractAt('Order',orderAddr);

    // get the wallet id of the user
    const wid = await getWalletId(email);

    // pay for the order
    try {
        orderContract.payAmount();
        console.log(`✅ Payment of ${price} made for order ${orderAddr}`);
    } catch (error) {
        console.error(error);
    }
}