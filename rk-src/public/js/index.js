/* functions to handle index page */

async function blankPages() {
    const landingPage = document.querySelector('.landing-page');
    const accountsPage = document.querySelector('.accounts-page');
    const ordersPage = document.querySelector('.orders-page');
    const walletsPage = document.querySelector('.wallets-page');
    const transactionsPage = document.querySelector('.transactions-page');
    const settingsPage = document.querySelector('.settings-page');

    [landingPage, accountsPage, ordersPage, walletsPage, transactionsPage, settingsPage].forEach((page) => {
        page.style.display = 'none';
    });
}

async function showLandingPage() {
    await blankPages();
    const landingPage = document.querySelector('.landing-page');
    landingPage.style.display = 'flex';
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


// Initially show the landing page
document.addEventListener('DOMContentLoaded', async function() {
    await showLandingPage();
});