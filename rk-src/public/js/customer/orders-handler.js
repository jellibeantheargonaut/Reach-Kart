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
    element.style.backgroundColor = 'rgba(171, 171, 171, 0.929)';
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
    const orders = await fetch('/users/viewOrders', {
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

    orders.forEach((order) => {
        const element = document.createElement('div');
        element.classList.add('orders-list-item');
        element.innerHTML = `
            <div class="orders-item-thumbnail">
                <img src="">
                <div>
                    <p> ${order.orderId} </p>
                    <p> ${formatDate(order.orderPlaced)} </p>
                </div>
            </div>
        `;
        ordersContainer.appendChild(element);
    });
    
}