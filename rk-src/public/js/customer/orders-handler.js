/* javascript functions to handle orders */

function formatDate(date) {
    const timestamp = new Date(date);
    const format = timestamp.toLocaleDateString('en-US', {
        month: 'long',      // Full month name (e.g., "January")
        day: 'numeric',     // Day of the month (e.g., "1")
        year: 'numeric',    // Full year (e.g., "2023")
        hour: 'numeric',    // Hour (e.g., "12")
        minute: 'numeric',  // Minute (e.g., "30")
        second: 'numeric',  // Second (e.g., "45")
        hour12: true        // Use 12-hour clock (e.g., "AM/PM")
    });
    return format;
}

async function expandOrder(button){
    const element = button.parentElement;
    element.style.backgroundColor = 'rgb(160, 212, 242)';
    element.style.padding = '5px';
    element.style.paddingBottom = '0';

    const orderDetails = element.querySelector('.orders-item-details');
    if(orderDetails.style.display === 'flex'){
        await collapseOrder(element);
        return;
    }
    orderDetails.style.display = 'flex';
}

async function collapseOrder(element){
    element.style.backgroundColor = 'white';
    element.style.padding = '0';

    const orderDetails = element.querySelector('.orders-item-details');
    orderDetails.style.display = 'none';
    const orderFooter = element.querySelector('.orders-item-footer');
    orderFooter.style.display = 'none';
}

async function getOrders() {
    const ordersContainer = document.querySelector('.orders-list-container');
    ordersContainer.innerHTML = '';

    // get orders from server
    const orders = await fetch('/user/viewOrders', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((res) => res.json());

    if (orders.length === 0) {
        ordersContainer.innerHTML = '<h2>No orders found</h2>';
        return;
    }
    console.log(orders);

    orders.forEach(async (order) => {
        const productData = await fetch(`/product/${order.productId}`).then((res) => res.json());
        const element = document.createElement('div');
        element.classList.add('orders-list-item');
        element.innerHTML = `
            <div class="orders-item-thumbnail" onclick="expandOrder(this)">
                <img src="${productData.productImage}">
                <div>
                    <p> ${order.orderId} </p>
                    <p> ${formatDate(order.orderPlaced)} </p>
                </div>
            </div>
            <div class="orders-item-details">
                <p style="font-weight : 600;"> ${productData.productName} </p>
                <p> Quantity : ${productData.productQuantity} </p>
                <p> Order Placed : ${formatDate(order.orderPlaced)} </p>
                ${
                    order.orderConfirmed
                    ? `<p> Order Confirmed : ${formatDate(order.orderConfirmed)} </p>`
                    : ''
                }
                ${
                    order.orderCancelled
                    ? `<p> Order Cancelled : ${formatDate(order.orderCancelled)} </p>`
                    : ''
                } 
                ${
                    order.orderPaid
                    ? `<p> Order Paid : ${formatDate(order.orderPaid)} </p>`
                    : ''
                }
                ${
                    order.orderRefunded
                    ? `<p> Order Refunded : ${formatDate(order.orderRefunded)} </p>`
                    : ''
                }
            </div>
            <div class="orders-item-footer">
            </div>
        `;
        ordersContainer.appendChild(element);
    });
}