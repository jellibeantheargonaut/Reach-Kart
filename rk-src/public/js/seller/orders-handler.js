// Javascript to handle order to the shop

async function getOrders(){
    const response = await fetch('/seller/viewOrders', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if(!response.ok){
        console.log(response.json().message);
        return;
    }

    console.log(response.json());
}