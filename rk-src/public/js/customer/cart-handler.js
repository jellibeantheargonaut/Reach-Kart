// javascript functions to manage carts

async function getCart() {
    const items = await fetch('/user/viewCart', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((res) => res.json());

    // cart div
    const dropdown = document.querySelector('.cart-items-list');
    dropdown.innerHTML = '';
    items.forEach((item) => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.productImage}">
                </div>
                <div class="cart-item-body">
                    <p> ${item.productName} </p>
                    <p> ${item.productPrice} <i class="fa-brands fa-ethereum"></i></i> </p>
                    <p> ${item.price} <i class="fa-brands fa-ethereum"></i> </p>
                    <input type="number" value="${item.quantity}" min="1"/>
                    <div class="cart-item-controls">
                        <div class="cart-item-control-button">
                            Remove
                        </div>
                        <div class="cart-item-control-button">
                            Buy
                        </div>
                    </div>
                </div>
            </div>
        `;

        
        dropdown.appendChild(cartItem);
    });
    // cart control buttons div
    const cartControls = document.createElement('div');
    cartControls.classList.add('cart-controls');
    cartControls.innerHTML = `
        <div class="cart-control-button" onclick="productCheckout('111','cart')">
            Checkout
        </div>
        <div class="cart-control-button" onclick="emptyCart()">
            Empty
        </div>
    `;
    dropdown.appendChild(cartControls);
}

async function addItemToCart(productId){
    const response = await fetch(`/user/addToCart/${productId}` , {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if(!response.ok){
        console.log("Error happened", response.status);
        return;
    }

    return response.json();
}

async function emptyCart(){
    const response = await fetch('/user/emptyCart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if(!response.ok){
        console.log("Error : ", response.json().message);
    }

    console.log(response.json().message);
    getCart();
    return;
}

async function checkoutCart(){
    const response = await fetch('/user/checkoutCart', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if(!response.ok){
        console.log(response.json().message);
        return;
    }
    console.log(response.json().message);
    return;

}
