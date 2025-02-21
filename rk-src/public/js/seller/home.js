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
// function to handle overlay message box
//==============================================================================
function showOverlayMessage(message) {
    const messageOverlay = document.querySelector('.message-overlay');
    messageOverlay.style.display = 'flex';
    const messageContainer = messageOverlay.querySelector('.message-container');
    messageContainer.style.display = 'flex';
    const messageContent = messageOverlay.querySelector('.message-content');
    messageContent.innerHTML = message;
}

function closeOverlayMessage() {
    const messageOverlay = document.querySelector('.message-overlay');
    messageOverlay.style.display = 'none';
    const messageContainer = messageOverlay.querySelector('.message-container');
    messageContainer.style.display = 'none';
}

function showConfirmMessage(message, onConfirmMessage, onCancelMessage) {
    const messageOverlay = document.querySelector('.message-overlay');
    messageOverlay.style.display = 'flex';
    const messageConfirmDiv = messageOverlay.querySelector('.message-confirm');
    messageConfirmDiv.style.display = 'flex';
    const confirmContent = messageConfirmDiv.querySelector('.message-text');
    confirmContent.innerHTML = message;

    // close when clicked outside
    messageOverlay.addEventListener('click', (e) => {
        if(e.target !== messageConfirmDiv){
            closeConfirmMessage();
        }
    }
    );

    // message buttons
    const messageButtons = messageConfirmDiv.querySelectorAll('.message-button');
    messageButtons[0].addEventListener('click', () => {
        closeConfirmMessage();
        onConfirmMessage();
    });
    messageButtons[1].addEventListener('click', () => {
        closeConfirmMessage();
        onCancelMessage();
    });

}

function closeConfirmMessage(){
    const confirmOverlay = document.querySelector('.message-overlay');
    confirmOverlay.style.display = 'none';
    const messageConfirmDiv = confirmOverlay.querySelector('.message-confirm');
    messageConfirmDiv.style.display = 'none';
}

//==============================================================================
// functions for managing shop
//==============================================================================
async function showShop(element) {
    blankDivs();
    selectButton(element);
    await setShopName();
    const shopDiv = document.querySelector('.shop-container');
    shopDiv.style.display = 'flex';
}

async function openAddProductCard() {
    
    // disable the add product button
    const addProductButton = document.querySelectorAll('.product-add-button');
    addProductButton[0].style.display = 'flex';
    addProductButton[1].style.display = 'none';

    const addProductCard = document.querySelector('.product-add-card');
    addProductCard.style.display = 'flex';
}

async function closeAddProductCard() {
    const addProductButton = document.querySelectorAll('.product-add-button');
    addProductButton[0].style.display = 'none';
    addProductButton[1].style.display = 'flex';

    const addProductCard = document.querySelector('.product-add-card');
    addProductCard.style.display = 'none';
}

//==============================================================================
// functions for managing orders
//==============================================================================
async function showOrders(element) {
    blankDivs();
    selectButton(element);
    const ordersDiv = document.querySelector('.orders-container');
    ordersDiv.style.display = 'flex';
}

async function openOrderView(element){
    // set the overlay view
    const ordersOverlayView = document.querySelector('.orders-overlay-view');
    ordersOverlayView.style.display = 'flex';

    const orderId = element.querySelector('.orders-list-item-id').innerHTML;
    //const orderDetails = await fetch(`/seller/viewOrder/${orderId}`).then(res => res.json());

    const ordersOverlayContainer = ordersOverlayView.querySelector('.orders-overlay-container');
    ordersOverlayView.addEventListener('click', (e) => {
        if(e.target === ordersOverlayView){
            closeOrderView();
        }
    });
}

async function setOrderView(orderDetails){
}

async function closeOrderView(){
    const orderOverlayView = document.querySelector('.orders-overlay-view');
    orderOverlayView.style.display = 'none';
}

//==============================================================================
// functions for managing shipments
//==============================================================================
async function showShipments(element) {
    blankDivs();
    selectButton(element);
    const shipmentsDiv = document.querySelector('.shipments-container');
    shipmentsDiv.style.display = 'flex';
}
async function openShipmentView(element){
    const shipmentOverlayView = document.querySelector('.shipments-overlay-view');
    shipmentOverlayView.style.display = 'flex';

    const shipmentId = element.querySelector('.shipments-list-item-id').innerHTML;
    //const shipmentDetails = await fetch(`/seller/viewShipment/${shipmentId}`).then(res => res.json());

    const shipmentOverlayContainer = shipmentOverlayView.querySelector('.shipments-overlay-container');
    shipmentOverlayView.addEventListener('click', (e) => {
        if(e.target === shipmentOverlayView){
            closeShipmentView();
        }
    });
}
async function closeShipmentView(){
    const shipmentOverlayView = document.querySelector('.shipments-overlay-view');
    shipmentOverlayView.style.display = 'none';
}

async function openAddShipmentCard() {
    const addShipmentButton = document.querySelectorAll('.shipments-add-card-button');
    addShipmentButton[0].style.display = 'flex';
    addShipmentButton[1].style.display = 'none';

    const addShipmentCard = document.querySelector('.shipments-add-card');
    addShipmentCard.style.display = 'flex';
}
async function closeAddShipmentCard() {
    const addShipmentButton = document.querySelectorAll('.shipments-add-card-button');
    addShipmentButton[0].style.display = 'none';
    addShipmentButton[1].style.display = 'flex';

    const addShipmentCard = document.querySelector('.shipments-add-card');
    addShipmentCard.style.display = 'none';
}

//==============================================================================
// functions for managing transactions
//==============================================================================
async function showTransactions(element) {
    blankDivs();
    selectButton(element);
    const transactionsDiv = document.querySelector('.transactions-container');
    transactionsDiv.style.display = 'flex';
}
async function openTransactionView(element){
    const transactionOverlayView = document.querySelector('.transactions-overlay-view');
    transactionOverlayView.style.display = 'flex';

    //const transactionDetails = await fetch(`/seller/viewTransaction/${transactionId}`).then(res => res.json());

    const transactionOverlayContainer = transactionOverlayView.querySelector('.transactions-overlay-container');
    transactionOverlayView.addEventListener('click', (e) => {
        if(e.target === transactionOverlayView){
            closeTransactionView();
        }
    });
}
async function closeTransactionView(){
    const transactionOverlayView = document.querySelector('.transactions-overlay-view');
    transactionOverlayView.style.display = 'none';
}
//==============================================================================
// function to user wallet details
//==============================================================================
async function showWallets(element) {
    blankDivs();
    selectButton(element);
    const walletsDiv = document.querySelector('.wallets-container');
    walletsDiv.style.display = 'flex';
}

//==============================================================================

async function setUserName() {
    const nameDiv = document.querySelector('.profile-name');
    nameDiv.innerHTML = '';
    const userInfo = await fetch('/common/getUserDetails').then(res => res.json());
    nameDiv.appendChild(document.createTextNode(userInfo.name));
}

async function setShopName() {
    const userName = await fetch('/common/getUserDetails').then(res => res.json());
    const shopName = document.querySelector('.shop-name');
    shopName.innerHTML = '';
    shopName.appendChild(document.createTextNode(userName.name + "'s Shop"));
}

//==============================================================================
// functions for managing addresses
//==============================================================================
async function showAddresses(element) {
    blankDivs();
    selectButton(element);
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