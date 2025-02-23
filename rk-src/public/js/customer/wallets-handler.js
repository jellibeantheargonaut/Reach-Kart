/* javascript functions to handle wallets */

async function getWallets() {
    const walletsContainer = document.querySelector('.wallets-list-container');
    walletsContainer.innerHTML = '';

    // get wallets from server
    const wallets = await fetch('/user/getWallets', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((res) => res.json());

    if (wallets.length === 0) {
        walletsContainer.innerHTML = '<h2>No wallets found</h2>';
        return;
    }

    wallets.forEach((wallet) => {
        const walletListItem = document.createElement('div');
        walletListItem.classList.add('wallets-list-item');
        walletListItem.innerHTML = `
            <div class="wallets-item-thumbnail">
                <img src="/img/ether-wallet.png">
                <div>
                    <p> ${wallet.walletId} </p>
                    <p> ${wallet.balance} <i class="fa-brands fa-ethereum"></i></p>
                </div>
            </div>
        `;
        walletsContainer.appendChild(walletListItem);
    });
}

//async function createWallet() {}
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
        getWallets();
    }, 2000);
}