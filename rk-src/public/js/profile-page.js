async function setWalletDetails() {
    const addressDiv = document.querySelector('.wallet-address');
    const balanceDiv = document.querySelector('.wallet-balance');
    addressDiv.innerHTML = '';
    balanceDiv.innerHTML = '';
    const walletIcon = document.createElement('i');
    const etherIcon = document.createElement('i');
    walletIcon.classList.add('fa-solid', 'fa-wallet');
    etherIcon.classList.add('fa-brands','fa-ethereum');

    const userInfo = await fetch('/common/getUserDetails').then(res => res.json());
    const walletBalance = await fetch('/common/getWalletBalance').then(res => res.json());
    addressDiv.appendChild(walletIcon);
    addressDiv.appendChild(document.createTextNode(userInfo.walletId));
    balanceDiv.appendChild(etherIcon);
    console.log(walletBalance);
    balanceDiv.appendChild(document.createTextNode(walletBalance.balance));
}