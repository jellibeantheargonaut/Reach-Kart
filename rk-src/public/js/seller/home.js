// function to blank some divs
function blankDivs() {
    const accountDiv = document.querySelector('.account-container');
    const shopDiv = document.querySelector('.shop-container');
    const ordersDiv = document.querySelector('.orders-container');
    const shipmentsDiv = document.querySelector('.shipments-container');
    const transactionsDiv = document.querySelector('.transactions-container');
    const walletsDiv = document.querySelector('.wallets-container');
    const addressesDiv = document.querySelector('.addresses-container');
    [ accountDiv, shopDiv, ordersDiv, shipmentsDiv, transactionsDiv, walletsDiv, addressesDiv ]
    .forEach(div => {
        div.style.display = 'none';
    });
}

// function to select a button
function selectButton(button){
    const buttons = document.querySelectorAll('.sidebar-menu-item');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
    });
    button.classList.add('selected');
}

//==============================================================================
// functions for managing shop
//==============================================================================
async function showShop(element) {
    blankDivs();
    selectButton(element)
    const shopDiv = document.querySelector('.shop-container');
    shopDiv.style.display = 'flex';
}

//==============================================================================
// functions for managing orders
//==============================================================================
async function showOrders() {
    blankDivs();
    const ordersDiv = document.querySelector('.orders-container');
    ordersDiv.style.display = 'flex';
}

//==============================================================================
// functions for managing shipments
//==============================================================================
async function showShipments() {
    blankDivs();
    const shipmentsDiv = document.querySelector('.shipments-container');
    shipmentsDiv.style.display = 'flex';
}

//==============================================================================
// functions for managing transactions
//==============================================================================
async function showTransactions() {
    blankDivs();
    const transactionsDiv = document.querySelector('.transactions-container');
    transactionsDiv.style.display = 'flex';
}

//==============================================================================
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
// functions for managing addresses
//==============================================================================
async function showAddresses() {
    blankDivs();
    const addressesDiv = document.querySelector('.addresses-container');
    addressesDiv.style.display = 'flex';
}

//==============================================================================
// function to show profile details
//==============================================================================
async function showAccountDetails(element) {
    blankDivs();
    selectButton(element);
    const accountDiv = document.querySelector('.account-container');
    accountDiv.style.display = 'flex';

    const accountDetailsCard = document.querySelector('.account-details-card');
    const userInfo = await fetch('/common/getUserDetails').then(res => res.json());
    accountDetailsCard.querySelector('#account-name').innerHTML = userInfo.name;
    accountDetailsCard.querySelector('#account-email').innerHTML = `Email : ${userInfo.email}`;
    accountDetailsCard.querySelector('#account-walletid').innerHTML = `Wallet ID : ${userInfo.walletId}`;
    accountDetailsCard.querySelector('#account-address').innerHTML = `Address : ${userInfo.address.address}`;
    console.log(userInfo);
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