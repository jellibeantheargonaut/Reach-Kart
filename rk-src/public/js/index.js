/* functions to handle index page */
async function blankPages() {
    const accountsPage = document.querySelector('.accounts-page');
    const ordersPage = document.querySelector('.orders-page');
    const walletsPage = document.querySelector('.wallets-page');
    const transactionsPage = document.querySelector('.transactions-page');
    const settingsPage = document.querySelector('.settings-page');

    [accountsPage, ordersPage, walletsPage, transactionsPage, settingsPage].forEach((page) => {
        page.style.display = 'none';
    });
}

async function blankMainPages() {
    const landingPage = document.querySelector('.landing-page');
    const productViewPage = document.querySelector('.product-page');
    const productCheckoutPage = document.querySelector('.product-checkout-page');
    const searchResultsPage = document.querySelector('.search-results-page');

    [ landingPage, productViewPage, productCheckoutPage, searchResultsPage ].forEach((element) => {
        element.style.display = 'none';
    });
}

async function showLandingPage() {
    await blankPages();
    await blankMainPages();
    const landingPage = document.querySelector('.landing-page');
    landingPage.style.display = 'flex';
}

async function showProductViewPage() {
    await blankPages();
    await blankMainPages();
    const productViewPage = document.querySelector('.product-page');
    productViewPage.style.display = 'flex';
}

async function showProductCheckoutPage() {
    await blankPages();
    await blankMainPages();
    const productCheckoutPage = document.querySelector('.product-checkout-page');
    productCheckoutPage.style.display = 'flex';
}

async function showAccountsPage() {
    await blankPages();
    const accountsPage = document.querySelector('.accounts-page');
    accountsPage.style.display = 'flex';
}

async function showOrdersPage() {
    await blankPages();
    const ordersPage = document.querySelector('.orders-page');
    ordersPage.style.display = 'flex';
}

async function showWalletsPage() {
    await blankPages();
    const walletsPage = document.querySelector('.wallets-page');
    walletsPage.style.display = 'flex';
}

async function showTransactionsPage() {
    await blankPages();
    const transactionsPage = document.querySelector('.transactions-page');
    transactionsPage.style.display = 'flex';
}

async function showSettingsPage() {
    await blankPages();
    const settingsPage = document.querySelector('.settings-page');
    settingsPage.style.display = 'flex';
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
// Initially show the landing page
document.addEventListener('DOMContentLoaded', async function() {
    //await showLandingPage();
    //await showProductViewPage();
});