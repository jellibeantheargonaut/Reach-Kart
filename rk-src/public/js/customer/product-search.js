// javascript to manage product search

async function search(searchString){
    try {
        if( !searchString || searchString.trim() === ''){
            return;
        }
        
        const payload = {
            search : searchString
        }
        const response = await fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if(!response.ok){
            console.error('Error performing search:', response.statusText);
            return response.json();
        }

        const searchResults = await response.json();
        console.log(searchResults);
        return searchResults;
    } catch(err){
        console.error('Error :',err);
    }
}

async function showSearchResults(searchString){
    blankMainPages();
    const searchResultsPage = document.querySelector('.search-results-page');
    const searchResultsContainer = document.querySelector('.search-results-container');

    searchResultsPage.style.display = 'flex';
    searchResultsContainer.innerHTML = '';

    const searchResults = await search(searchString);

    searchResults.forEach(product => {
        
        const div = document.createElement('div');
        div.classList.add('search-results-item');
        div.id = `${product.productId}`;
        div.innerHTML = `
            <div class="search-results-item-image">
                <img src="${product.productImage}">
            </div>
            <div class="search-results-item-info" onclick="openProductView(${product.productId})" >
                <p style="font-size: 1.8rem;font-weight: 600;"> ${product.productName}</p>
                <p style="font-size: 1.2rem;font-weight: 300;"> ${product.productDescription} </p>
                <p style="font-weight: 600; padding-top: 10px;"> ${product.productPrice} <i class="fa-brands fa-ethereum"></i></p>
                <p style="font-size: 1rem; color: rgb(9, 138, 9); padding-top: 10px; font-weight: 800;"> In Stock: ${product.productQuantity} </p>
                <div class="search-results-item-buttons">
                    <div class="search-results-item-button" onclick="productCheckout('${product.productId}','product')">
                        Buy Now
                    </div>
                    <div class="search-results-item-button" onclick="addItemToCart('${product.productId}')" >
                        Add to Cart
                    </div>
                </div>
            </div>
        `;

        searchResultsContainer.appendChild(div);
    });
}

async function getProductDetails(productId){
    const response = await fetch(`/product/${productId}` ,{ 
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if(response.status !== 200){
        console.error("Error : ", response.status);
        return [];
    }

    return response.json();

}

async function openProductView(productId){

    showProductViewPage();
    //const productId = element.id;
    const details = await getProductDetails(productId);

    const container = document.querySelector('.product-details-container');
    container.id = `${details.productId}`;
    container.innerHTML = `
        <div class="product-details-image">
            <img src="${details.productImage}">
        </div>
        <div class="product-details-info">
            <p> ${details.productName} </p>
            <p> ${details.productDescription} </p>
            <p style="font-size: 2rem;"> ${details.productPrice} <i class="fa-brands fa-ethereum"></i> </p>
            <div class="product-checkout-controls">
                <div class="product-checkout-control-button">
                    Add to Cart
                </div>
                <div class="product-checkout-control-button">
                    Buy Now
                </div>
            </div>
        </div>
    `;
}

async function productCheckout(productId,mode){
    showProductCheckoutPage();

    const checkoutList = document.querySelector('.product-checkout-container-content');
    checkoutList.innerHTML = ``;

    if(mode == 'product'){
        const details = await getProductDetails(productId);
        const checkoutItem = document.createElement('div');
        checkoutItem.classList.add('product-checkout-item');
        checkoutItem.id = details.productId;
        checkoutItem.innerHTML = `
            <img src="${details.productImage}">
            <div class="product-checkout-item-info">
                <p style="font-size: 1.5rem;font-weight: 600;"> ${details.productName} </p>
                <p style="font-size: 1.2rem;font-weight: 400;"> ${details.productDescription} </p>
                <p style="font-size: 1rem;font-weight: 700; padding-top: 20px;"> ${details.productPrice} <i class="fa-brands fa-ethereum"></i> </p>
            </div>
        `;
        checkoutList.appendChild(checkoutItem);
    }
    else if( mode == 'cart'){
        const cartItems = await fetch('/user/viewCart', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => res.json());

        cartItems.forEach(async (product) => {
            const details = await getProductDetails(product.productId);
            const checkoutItem = document.createElement('div');
            checkoutItem.classList.add('product-checkout-item');
            checkoutItem.id = details.productId;
            checkoutItem.innerHTML = `
                <img src="${details.productImage}">
                <div class="product-checkout-item-info">
                    <p style="font-size: 1.5rem;font-weight: 600;"> ${details.productName} </p>
                    <p style="font-size: 1.2rem;font-weight: 400;"> ${details.productDescription} </p>
                    <p style="font-size: 1rem;font-weight: 700; padding-top: 20px;"> ${details.productPrice} <i class="fa-brands fa-ethereum"></i> </p>
                </div>
            `;
            checkoutList.appendChild(checkoutItem);
        })
    }

    // for wallets drop down
    //==================================================
    const wallets = await fetch('/user/getWallets', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((res) => res.json());

    const walletDropdown = document.querySelectorAll('.product-checkout-dropdown')[0];
    walletDropdown.innerHTML = ``;

    const walletTitle = document.createElement('p');
    walletTitle.innerText = 'Select Wallet :';
    walletDropdown.appendChild(walletTitle);
    const select1 = document.createElement('select');
    walletDropdown.appendChild(select1);
    wallets.forEach((wallet) => {
        const option = document.createElement('option');
        option.value = wallet.walletId;
        option.innerText = wallet.walletId;
        select1.appendChild(option);
    });

    // for addresses dropdown
    //===================================================
    const addresses = await fetch('/user/getAddresses', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((res) => res.json());

    const addressDropdown = document.querySelectorAll('.product-checkout-dropdown')[1];
    addressDropdown.innerHTML = ``;

    const addressTitle = document.createElement('p');
    addressTitle.innerText = 'Choose Address :';
    addressDropdown.appendChild(addressTitle);
    const select2 = document.createElement('select');
    addressDropdown.appendChild(select2);
    addresses.forEach((address) => {
        const option = document.createElement('option');
        option.value = address.addressId;
        option.innerText = address.addressValue;
        select2.appendChild(option);
    });
}

async function placeOrder(productId, addressId, walletId, quantity) {
    const data = {
        addressId: addressId,
        walletId: walletId,
        productId: productId,
        quantity: quantity,
    };

    try {
        const response = await fetch('/user/placeOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            showOverlayMessage(`Error: ${error.message}`);
            return;
        }

        const result = await response.json();
        showOverlayMessage(result.message);

        // Wait for the transaction to be mined
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Adjust delay if needed
    } catch (err) {
        console.error('Error placing order:', err);
        showOverlayMessage('Failed to place order. Please try again.');
    } finally {
        setTimeout(() => {
            closeOverlayMessage();
        }, 2000);
    }
}

async function showPurchaseConfirmation() {
    const productId = document.querySelector('.product-checkout-item').id;
    const options = document.querySelectorAll('.product-checkout-dropdown select');

    const walletId = options[0].value;
    const addressId = options[1].value;
    showConfirmMessage("Place order", () => placeOrder(productId,addressId,walletId,1), () => {});
}

document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('keypress', (event) => {
        if(event.key === 'Enter'){
            const searchString = searchBar.value.trim();
            if(searchString){
                showSearchResults(searchString);
            }
        }
    })
})