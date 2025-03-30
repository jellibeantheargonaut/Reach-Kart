const { v4: uuid } = require("uuid");
const { ethers } = require("hardhat");

async function main() {
  const providerUrl = 'http://localhost:8545';
  const provider = new ethers.JsonRpcProvider(providerUrl);

  const [deployer] = await ethers.getSigners();

  const buyer = ethers.Wallet.createRandom().connect(provider);
  console.log("Buyer address:", buyer.address);
  const seller = ethers.Wallet.createRandom().connect(provider);
  console.log("Seller address:", seller.address);

  // Fund the buyer with 2 ETH from the deployer account
  console.log("Funding buyer with 2 ETH");
  let tx = await deployer.sendTransaction({
    to: buyer.address,
    value: ethers.parseEther("200")
  });
  await tx.wait();
  tx = await deployer.sendTransaction({
    to: seller.address,
    value: ethers.parseEther("200")
  });
  await tx.wait();
  console.log("Buyer funded with 2 ETH");

  const Order = await ethers.getContractFactory('Order');
  const orderContract = await Order.deploy(
    Math.floor(Date.now() / 1000) + 3600, // Order time 1 hour from now
    seller.address,
    buyer.address,
    uuid(),
    ethers.parseEther("3") // Initial funding for the order contract
  );
  console.log(`✅ Order Contract deployed at ${orderContract.address}`);


  console.log("Order status:", await orderContract.getStatus());

  // Confirm the order
  tx = await orderContract.confirmOrder();
  await tx.wait();
  console.log("✅ Order confirmed");
  console.log("Order status:", await orderContract.getStatus());
  console.log("Seller balance:", ethers.formatEther(await provider.getBalance(seller.address)));

  // Pay for the order
  tx = await orderContract.connect(buyer).payAmount({ value: ethers.parseEther("3") });
  await tx.wait();
  console.log("✅ Payment made for order");
  console.log("Buyer balance:", ethers.formatEther(await provider.getBalance(buyer.address)));
  console.log("seller balance:", ethers.formatEther(await provider.getBalance(seller.address)));
  console.log("Order status:", await orderContract.getStatus());

  // Ship the order
  tx = await orderContract.connect(seller).shipOrder();
  await tx.wait();
  console.log("✅ Order shipped");
  console.log("Buyer balance:", ethers.formatEther(await provider.getBalance(buyer.address)));
  console.log("Order status:", await orderContract.getStatus());

  // Confirm delivery
  tx = await orderContract.confirmDelivery();
  await tx.wait();
  console.log("✅ Order delivered");
  console.log("Order status:", await orderContract.getStatus());

  // Return the order
  tx = await orderContract.returnOrder();
  await tx.wait();
  console.log("✅ Order returned");
  console.log("Order status:", await orderContract.getStatus());

  // Get refund
  tx = await orderContract.connect(seller).getRefund({ value: ethers.parseEther("3") });
  await tx.wait();
  console.log("✅ Order refunded");
  console.log("Order status:", await orderContract.getStatus());
  console.log("Seller balance:", ethers.formatEther(await provider.getBalance(seller.address)));

  // Withdraw the refund

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });