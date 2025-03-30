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
            <div class="wallets-item-thumbnail" onclick="expandWallet(this)">
                <img src="/img/ether-wallet.png">
                <div>
                    <p>${wallet.walletId}</p>
                    <p>${wallet.balance} <i class="fa-brands fa-ethereum"></i></p>
                </div>
            </div>
            <div class="wallets-item-controls">
                <div class="wallets-item-control-button" onclick="confirmDeleteWallet(this)">
                    Delete 
                </div>
                <div class="wallets-item-control-button" onclick="confirmSetPrimaryWallet(this)">
                    Set primary
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

// function to delete wallet
async function deleteWallet(walletId) {
    const params = {
        walletId: walletId
    }
    const response = await fetch('/user/deleteWallet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (response.status === 200) {
        showOverlayMessage('Wallet deleted successfully');
    } else {
        showOverlayMessage(`${response.json().then((res) => res.message)}`);
    }

    setTimeout(() => {
        closeOverlayMessage();
        getWallets();
    }, 2000);
}

// function to set wallet as primary
async function setPrimaryWallet(walletId) {
    const params = {
        walletId: walletId
    }
    const response = await fetch('/user/setDefaultWallet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (response.status === 200) {
        showOverlayMessage('Wallet set as primary successfully');
    } else {
        showOverlayMessage(`${response.json().then((res) => res.message)}`);
    }

    setTimeout(() => {
        closeOverlayMessage();
        getWallets();
    }, 2000);
}

// function to confirm wallet deletion
async function confirmDeleteWallet(element){
    const walletItem = element.parentElement.parentElement;
    const walletThumbnail = walletItem.querySelector('.wallets-item-thumbnail');
    const walletId = walletThumbnail.querySelectorAll('p')[0].innerHTML;
    showConfirmMessage(`Are you sure you want to delete ${walletId}`,() => deleteWallet(walletId), () => {});
}

// function to confirm setting wallet as primary
async function confirmSetPrimaryWallet(element){
    const walletItem = element.parentElement.parentElement;
    const walletThumbnail = walletItem.querySelector('.wallets-item-thumbnail');
    const walletId = walletThumbnail.querySelectorAll('p')[0].innerHTML;
    showConfirmMessage(`Are you sure you want to set ${walletId} as primary`,() => setPrimaryWallet(walletId), () => {});
}

async function expandWallet(button) {
    const element = button.parentElement;
    element.style.backgroundColor = 'rgba(171, 171, 171, 0.929)';
    element.style.padding = '5px';
    element.style.paddingBottom = '0';

    const walletControls = element.querySelector('.wallets-item-controls');
    if (walletControls.style.display === 'flex') {
        await collapseWallet(element);
        return;
    }
    walletControls.style.display = 'flex';
}

async function collapseWallet(element) {
    element.style.backgroundColor = 'white';
    element.style.padding = '0';

    const walletControls = element.querySelector('.wallets-item-controls');
    walletControls.style.display = 'none';
}