// function to blank some divs
function blankDivs() {
    const accountDiv = document.querySelector('.account-container');
    const ordersDiv = document.querySelector('.orders-container');
    const walletsDiv = document.querySelector('.wallets-container');
    const addressesDiv = document.querySelector('.addresses-container');
    [ accountDiv , ordersDiv, walletsDiv, addressesDiv ].forEach(div => {
        div.style.display = 'none';
    });
}

// function to user wallet details
//==============================================================================
async function showWalletDetails() {

    blankDivs();
    const walletsDiv = document.querySelector('.wallets-container');
    walletsDiv.style.display = 'flex';
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

async function setUserName() {
    const nameDiv = document.querySelector('.profile-name');
    nameDiv.innerHTML = '';
    const userInfo = await fetch('/common/getUserDetails').then(res => res.json());
    nameDiv.appendChild(document.createTextNode(userInfo.name));
}

//==============================================================================

// function to show profile details
async function showAccountDetails() {
    blankDivs();
    const accountDiv = document.querySelector('.account-container');
    accountDiv.style.display = 'flex';

    const userInfo = await fetch('/common/getUserDetails').then(res => res.json());
}

//==============================================================================
// function to show orders
async function showOrders() {
    blankDivs();
    const ordersDiv = document.querySelector('.orders-container');
    ordersDiv.style.display = 'flex';
    const userInfo = await fetch('/common/getUserDetails').then(res => res.json());
}

function logout() {
    fetch('/common/logout', {
        method: 'GET'
    }).then((response) => {
        if (response.status === 200) {
            window.location.href = '/home';
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    blankDivs();
    await setUserName();
});