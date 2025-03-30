function formatDate(timestamp){
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12 || 12; // Convert 0 to 12 for AM format

    return `${year}-${month}-${day} at ${hours}:${minutes} ${ampm}`;
}
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

    //viewAvailableProducts();
}

async function openAddProductCard() {
    
    // disable the add product button
    const addProductButton = document.querySelectorAll('.product-add-button');
    addProductButton[0].style.display = 'flex';
    addProductButton[1].style.display = 'none';

    const addProductCard = document.querySelector('.product-add-card');
    addProductCard.style.display = 'flex';

    // get wallets from the user
    const wallets = await fetch('/user/getWallets').then(res => res.json());
    //set the wallets in the dropdown
    const walletDropdown = document.getElementById('wallet-select');
    walletDropdown.innerHTML = '';
    
    wallets.forEach(wallet => {
        const option = document.createElement('option');
        option.value = wallet.walletId;
        option.innerHTML = wallet.walletId;
        walletDropdown.appendChild(option);
    });
}

async function closeAddProductCard() {
    const addProductButton = document.querySelectorAll('.product-add-button');
    addProductButton[0].style.display = 'none';
    addProductButton[1].style.display = 'flex';

    const addProductCard = document.querySelector('.product-add-card');
    addProductCard.style.display = 'none';
}

async function uploadProduct(element) {
    const productForm = element.parentElement.parentElement;
    const productName = productForm.querySelector('#product-name').value;
    const productDescription = productForm.querySelector('#product-description').value;
    const productImage = productForm.querySelector('#product-image').value;
    const productPrice = productForm.querySelector('#product-price').value;
    const productQuantity = productForm.querySelector('#product-quantity').value;
    const walletId = productForm.querySelector('#wallet-select').value;

    const params = {
        productName: productName,
        productDescription: productDescription,
        productImage: productImage ? productImage : 'https://pixsector.com/cache/517d8be6/av5c8336583e291842624.png',
        productPrice: productPrice,
        productQuantity: productQuantity,
        walletId: walletId,
    }

    // upload the product
    const response = await fetch('/seller/uploadProduct', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    }).then(res => res.json());
    setTimeout(() => {
        showOverlayMessage('Product is being uploaded');
    }, 2000);
    if(response.status === 200){
        showOverlayMessage(`${response.message}`);
    }
    else{
        showOverlayMessage(`${response.message}`);
    }
    setTimeout(() => {
        closeOverlayMessage();
        closeAddProductCard();
    }, 2000);
}

async function viewAvailableProducts() {
    const shopList = document.querySelector('.products-list-body');
    shopList.innerHTML = '';

    const products = await fetch('/seller/availableProducts').then(res => res.json());

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-list-card');
        productCard.innerHTML = `
            <div class="product-list-card-header">
                <i class="fa-solid fa-ellipsis"></i>
            </div>
            <div class="product-list-card-image">
                <img src="${product.productImage}">
            </div>
            <div class="product-list-card-info">
                <p class="product-list-card-name"> ${product.productName} </p>
                <p class="product-list-card-description">${product.productDescription}</p>
                <p class="product-list-card-price"> <i class="fa-brands fa-ethereum"></i> ${product.productPrice} </p>
            </div>
        `;
        shopList.appendChild(productCard);
    });
}
//==============================================================================
// functions for managing orders
//==============================================================================
async function showOrders(element) {
    blankDivs();
    selectButton(element);
    const ordersDiv = document.querySelector('.orders-container');
    ordersDiv.style.display = 'flex';

    //viewOrders();
}

async function openOrderView(element){
    // set the overlay view
    const ordersOverlayView = document.querySelector('.orders-overlay-view');
    ordersOverlayView.style.display = 'flex';
    //ordersOverlayView.innerHTML = '';
//
    //const orderId = element.querySelector('.orders-list-item-id').innerHTML;
    //const orderDetails = await fetch(`/seller/viewOrder/${orderId}`).then(res => res.json());
//
    //const ordersOverlayContainer = document.createElement('div');
    //ordersOverlayContainer.classList.add('orders-overlay-container');
    //ordersOverlayContainer.innerHTML = `
    //    <div class="orders-view-image">
    //        <img src="https://media3.giphy.com/media/6BZaFXBVPBtok/giphy.gif?cid=6c09b952rjuqvisd6rgqk93j7goduey2yg4n9xyj4mrjsvcg&ep=v1_gifs_search&rid=giphy.gif&ct=g">
    //    </div>
    //    <div class="orders-view-details">
    //        <div class="orders-view-details-buyer">
    //            <p> Buyer : ${orderDetails.orderBuyer} </p>
    //            <p> wallet ID : ${orderDetails.orderBuyerAddress} </p>
    //            <p> Quantity : ${orderDetails.orderQuantity} </p>
    //            <p> Price : ${orderDetails.orderPrice} <i class="fa-brands fa-ethereum"></i></p>
    //        </div>
    //        <div class="orders-view-details-timeline">
    //            <p> Order Placed : ${formatDate(orderDetails.orderPlacedDate)}</p>
    //            <p> Order Confirmed : ${ orderDetails.orderConfirmedDate !== 'NA' ? formatDate(orderDetails.orderConfirmedDate) : orderDetails.orderConfirmedDate} </p>
    //            <p> Order Paid : ${ orderDetails.orderPaidDate !== 'NA' ? formatDate(orderDetails.orderPaidDate) : orderDetails.orderPaidDate}</p>
    //            <p> Order Shipped : NA </p>
    //        </div>
    //        <div class="orders-view-details-chain">
    //            <p> Order Address : 0x40BD293e0cc4929F0d5CD9289Cc35bF4Ab99914C </p>
    //            <p> Product Address : 0x40BD293e0cc4929F0d5CD9289Cc35bF4Ab99914C </p>
    //            <p> Order ID : 2cba052c-fe19-411b-bde2-55ee14cc36ac</p>
    //        </div>
    //    </div>
    //    `;
    //ordersOverlayView.appendChild(ordersOverlayContainer);

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

async function viewOrders() {
    const ordersList = document.querySelector('.orders-list');
    ordersList.innerHTML = '';
    const orders = await fetch('/seller/viewOrders').then(res => res.json());

    orders.forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.classList.add('orders-list-item');
        orderItem.innerHTML = `
        <div class="orders-list-item-image">
            <img src="https://pixsector.com/cache/517d8be6/av5c8336583e291842624.png">
        </div>
        <div class="orders-list-item-info">
            <p class="orders-list-item-name"> ${order.orderName} </p>
            <p class="orders-list-item-id">${order.orderId}</p>
            <p class="orders-list-item-price"> <i class="fa-brands fa-ethereum"></i> ${order.orderPrice} </p>
            <p class="orders-list-item-date"> ${formatDate(order.orderPlacedDate)} </p>
        </div>
        `;
        orderItem.addEventListener('click', () => {
            openOrderView(orderItem);
        });
        ordersList.appendChild(orderItem);
    });
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

    // get wallets from the user
    const wallets = await fetch('/user/getWallets').then(res => res.json());
    //set the wallets in the dropdown
    const walletDropdown = document.getElementById('shipment-wallet-select');
    walletDropdown.innerHTML = '';
    
    wallets.forEach(wallet => {
        const option = document.createElement('option');
        option.value = wallet.walletId;
        option.innerHTML = wallet.walletId;
        walletDropdown.appendChild(option);
    });
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

    const walletsList = document.querySelector('.wallets-list');
    walletsList.innerHTML = '';
    const wallets = await fetch('/user/getWallets').then(res => res.json());

    wallets.forEach(wallet => {
        const walletItem = document.createElement('div');
        walletItem.classList.add('wallets-list-item');
        walletItem.innerHTML = `
        <p>Wallet ID : ${wallet.walletId}</p>
        <p>Balance : ${wallet.balance} <i class="fa-brands fa-ethereum"></i></p>
        `;
        walletsList.appendChild(walletItem);
    });
}

async function createWallet() {
    const response = await fetch('/user/createWallet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (response.status === 200) {
        showOverlayMessage('Wallet created successfully');
    } else {
        showOverlayMessage(`${response.json().then((res) => res.message)}`);
    }
    
    setTimeout(() => {
        closeOverlayMessage();
        showWallets(document.querySelector('.sidebar-menu-item.wallets'));
    }, 2000);
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