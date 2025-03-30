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

    const accountDetailsCard = document.querySelector('.account-details-card');
    const userInfo = await fetch('/common/getUserDetails').then(res => res.json());
    console.log(userInfo.name);
    accountDetailsCard.querySelector('#account-name').innerHTML = userInfo.name;
    accountDetailsCard.querySelector('#account-email').innerHTML = userInfo.email;
}

//==============================================================================
// function to show orders of the user
async function showOrders() {
    blankDivs();
    const ordersDiv = document.querySelector('.orders-container');
    ordersDiv.style.display = 'flex';
//    const orders = await fetch('/users/viewOrders');
//    console.log(orders);
//
//    // show the orders in the div
//    const ordersContainer = document.querySelector('.orders-container');
//    ordersContainer.innerHTML = '';
//    orders.forEach(order => {
//        const orderContainer = document.createElement('div');
//        orderContainer.classList.add('order-container');
//
//        const orderContainerHeader = document.createElement('div');
//        orderContainerHeader.classList.add('order-container-header');
//        const OrderContainerContent = document.createElement('div');
//        OrderContainerContent.classList.add('order-container-content');
//        OrderContainerContent.classList.add(order.orderId);
//        const orderUUID = document.createElement('p');
//        orderUUID.setAttribute('id', 'order-uuid');
//        orderUUID.appendChild(document.createTextNode(order.orderId));
//
//        orderContainerHeader.appendChild(orderUUID);
//        orderContainer.appendChild(orderContainerHeader);
//        orderContainer.appendChild(OrderContainerContent);
//    });
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