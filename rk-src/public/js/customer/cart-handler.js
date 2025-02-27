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
                    <img src="https://i.imgflip.com/2vnbng.png?a483264">
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
        <div class="cart-control-button">
            Checkout
        </div>
        <div class="cart-control-button">
            Empty
        </div>
    `;
    dropdown.appendChild(cartControls);
}