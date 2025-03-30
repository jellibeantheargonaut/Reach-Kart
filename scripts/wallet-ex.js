const hre = require("hardhat");

async function main() {
  // Create a new random wallet
  const wallet = hre.ethers.Wallet.createRandom();

  console.log("New wallet address:", wallet.address);
  console.log("Private key:", wallet.privateKey);

  // Connect the wallet to the local Hardhat network provider
  const provider = hre.ethers.provider;
  const connectedWallet = wallet.connect(provider);

  console.log("Wallet connected to provider:", connectedWallet.address);

  // Fund the new wallet with some Ether (optional)
  const [signer] = await hre.ethers.getSigners();
  const tx = await signer.sendTransaction({
    to: connectedWallet.address,
    value: hre.ethers.parseEther("1.0"), // Send 1 ETH
  });

  await tx.wait();

  console.log("Funded new wallet with 1 ETH");

  // Check the balance of the new wallet
  const balance = await provider.getBalance(connectedWallet.address);
  console.log("New wallet balance:", hre.ethers.formatEther(balance), "ETH");

  // Send a transaction from the connected wallet
  const tx2 = await connectedWallet.sendTransaction({
    to: signer.address,
    value: hre.ethers.parseEther("0.5"), // Send 0.5 ETH back to the signer
  });

  await tx2.wait();

  console.log("Sent 0.5 ETH from the new wallet to the signer");

  // Check the balance of the new wallet again
  const newBalance = await provider.getBalance(connectedWallet.address);
  console.log("New wallet balance after sending 0.5 ETH:", hre.ethers.formatEther(newBalance), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });