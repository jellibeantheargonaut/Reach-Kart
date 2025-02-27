/* javascript to handle navigation bar */

// functions to handle search bar 
//==========================================================================
// contents are displayed in a container with class 'search-results-dropdown'


// functions to control and manage the account icon dropdown menu
//==========================================================================
// contents are displayed in a container with class 'account-menu-page'

// function to show account dropdown
//--------------------------------------------------------------------------
async function showAccountDropdown() {
    const accountIcon = document.querySelector('.navigation-bar-account');
    const accountDropdown = document.querySelector('.account-drop-down');
    if(accountDropdown.computedStyleMap().get('display').value === 'none'){ 
        accountDropdown.style.display = 'flex'; 
        accountIcon.style.backgroundColor = 'rgb(40,40,40)';
        accountIcon.style.color = 'white';
    }
    else { 
        accountDropdown.style.display = 'none';
        accountIcon.style.backgroundColor = 'rgb(168, 168, 168)';
        accountIcon.style.color = 'black';
    }
    
    // when clicked outside the dropdown close the dropdown
    document.addEventListener('click', function(event) {
        if(!accountIcon.contains(event.target) && !accountDropdown.contains(event.target)) {
            accountDropdown.style.display = 'none';
            accountIcon.style.backgroundColor = 'rgb(168, 168, 168)';
            accountIcon.style.color = 'black';
        }
    });
}
//--------------------------------------------------------------------------
async function openMenuPage() {
    const backgroundOverlay = document.querySelector('.background-overlay');
    backgroundOverlay.style.display = 'flex';
    const menuPage = document.querySelector('.account-menu-page');
    menuPage.style.display = 'flex';

    backgroundOverlay.addEventListener('click', (e) => {
        if(e.target !== menuPage || e.target !== backgroundOverlay){
            closeMenuPage();
        }
    })
}
async function closeMenuPage() {
    // close all the sub divs
    const accountsPage = document.querySelector('.accounts-page');
    const ordersPage = document.querySelector('.orders-page');
    const walletsPage = document.querySelector('.wallets-page');
    const transactionsPage = document.querySelector('.transactions-page');
    const settingsPage = document.querySelector('.settings-page');
    [ accountsPage, ordersPage, walletsPage, transactionsPage, settingsPage ].forEach(element => {
        element.style.display = 'none';
    });
    const backgroundOverlay = document.querySelector('.background-overlay');
    const menuPage = document.querySelector('.account-menu-page');
    backgroundOverlay.style.display = 'none';
    menuPage.style.display = 'none';

}
//--------------------------------------------------------------------------
// function to open account page 
async function openAccountsPage() {
    console.log('open account page');
    closeMenuPage();
    openMenuPage();

    // open the accounts-page div
    const accountsPage = document.querySelector('.accounts-page');
    accountsPage.style.display = 'flex';
}

async function openOrdersPage() {
    console.log('open orders page');
    closeMenuPage();
    openMenuPage();

    // open the orders-page div
    const ordersPage = document.querySelector('.orders-page');
    ordersPage.style.display = 'flex';

    // get orders from server
    getOrders();
}

async function openWalletsPage() {
    console.log('open wallets page');
    closeMenuPage();
    openMenuPage();

    // open the wallets-page div
    const walletsPage = document.querySelector('.wallets-page');
    walletsPage.style.display = 'flex';

    // get wallets from server
    getWallets();
}

async function openTransactionsPage() {
    console.log('open transactions page');
    closeMenuPage();
    openMenuPage();

    // open the transactions-page div
    const transactionsPage = document.querySelector('.transactions-page');
    transactionsPage.style.display = 'flex';
}

async function openSettingsPage() {
    console.log('open settings page');
    closeMenuPage();
    openMenuPage();

    // open the settings-page div
    const settingsPage = document.querySelector('.settings-page');
    settingsPage.style.display = 'flex';
}

//==========================================================================

async function showOrdersDropdown(element) {
    const ordersIcon = element;
    const ordersDropdown = document.querySelector('.orders-dropdown');
    const backgroundOverlay = document.querySelector('.background-overlay');
    if(ordersDropdown.computedStyleMap().get('display').value === 'none'){ 
        ordersDropdown.style.display = 'flex'; 
        ordersIcon.style.backgroundColor = 'rgb(40,40,40)';
        ordersIcon.style.color = 'white';
        backgroundOverlay.style.display = 'flex';
    }
    else { 
        ordersDropdown.style.display = 'none';
        ordersIcon.style.backgroundColor = 'rgb(168, 168, 168)';
        ordersIcon.style.color = 'black';
        backgroundOverlay.style.display = 'none';
    }
    
    // when clicked outside the dropdown close the dropdown
    backgroundOverlay.addEventListener('click', function(event) {
        if( event.target !== ordersDropdown && event.target !== ordersIcon) {
            ordersDropdown.style.display = 'none';
            ordersIcon.style.backgroundColor = 'rgb(168, 168, 168)';
            ordersIcon.style.color = 'black';
            backgroundOverlay.style.display = 'none';
        }
    });
}
async function showCartDropdown(element) {
    const cartIcon = element;
    const cartDropdown = document.querySelector('.cart-dropdown');
    const backgroundOverlay = document.querySelector('.background-overlay');
    if(cartDropdown.computedStyleMap().get('display').value === 'none'){ 
        cartDropdown.style.display = 'flex'; 
        cartIcon.style.backgroundColor = 'rgb(40,40,40)';
        cartIcon.style.color = 'white';
        backgroundOverlay.style.display = 'flex';
    }
    else { 
        cartDropdown.style.display = 'none';
        cartIcon.style.backgroundColor = 'rgb(168, 168, 168)';
        cartIcon.style.color = 'black';
        backgroundOverlay.style.display = 'none';
    }
    
    // when clicked outside the dropdown close the dropdown
    backgroundOverlay.addEventListener('click', function(event) {
        if( event.target !== cartDropdown && event.target !== cartIcon) {
            cartDropdown.style.display = 'none';
            cartIcon.style.backgroundColor = 'rgb(168, 168, 168)';
            cartIcon.style.color = 'black';
            backgroundOverlay.style.display = 'none';
        }
    }); 

    getCart();
}

async function setAccountName() {
    const accountIcon = document.querySelector('.navigation-bar-account p');
    const userDetails = await fetch('/common/getUserDetails', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const userDetailsJson = await userDetails.json();
    const accountName = userDetailsJson.name;
    accountIcon.innerHTML = accountName;
}

async function logout() {
    const response = await fetch('/common/logout', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if(response.status === 200) {
        window.location.href = '/common/signin';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // navigation-bar active when searching 
    const navBar = document.querySelector('.navigation-bar');
    const searchInput = document.querySelector('.navigation-bar-search input');
    searchInput.addEventListener('focus', function() {
        navBar.classList.add('navigation-bar-active');
    });

    setAccountName();
});