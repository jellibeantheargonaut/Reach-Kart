const hre = require("hardhat");

async function main() {
  // Get the signers (wallets) from Hardhat
  const [sender, receiver] = await hre.ethers.getSigners();

  console.log("Sender address:", sender.address);
  console.log("Receiver address:", receiver.address);

  // Get the balance of the sender and receiver before the transaction
  const senderBalanceBefore = await hre.ethers.provider.getBalance(sender.address);
  const receiverBalanceBefore = await hre.ethers.provider.getBalance(receiver.address);

  console.log("Sender balance before:", hre.ethers.formatEther(senderBalanceBefore), "ETH");
  console.log("Receiver balance before:", hre.ethers.formatEther(receiverBalanceBefore), "ETH");

  // Send 1 Ether from sender to receiver
  const amount = hre.ethers.parseEther("200"); // 1 Ether
  const tx = await sender.sendTransaction({
    to: receiver.address,
    value: amount,
  });

  // Wait for the transaction to be mined
  await tx.wait();

  console.log("Transaction hash:", tx.hash);

  // Get the balance of the sender and receiver after the transaction
  const senderBalanceAfter = await hre.ethers.provider.getBalance(sender.address);
  const receiverBalanceAfter = await hre.ethers.provider.getBalance(receiver.address);

  console.log("Sender balance after:", hre.ethers.formatEther(senderBalanceAfter), "ETH");
  console.log("Receiver balance after:", hre.ethers.formatEther(receiverBalanceAfter), "ETH");
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });