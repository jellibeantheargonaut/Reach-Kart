function newAddAddress(){
    const buttons = document.querySelectorAll('.address-add-button');
    buttons[0].style.display = 'none';
    buttons[1].style.display = 'flex';
    buttons[2].style.display = 'flex';

    const textarea = document.querySelector('.new-address-container');
    textarea.style.display = 'flex';
}

function cancelAddAddress() {
    const buttons = document.querySelectorAll('.address-add-button');
    buttons[0].style.display = 'flex';
    buttons[1].style.display = 'none';
    buttons[2].style.display = 'none';

    const textarea = document.querySelector('.new-address-container');
    textarea.style.display = 'none';
}

async function addAddress() {
    const textarea = document.querySelector('.new-address-container textarea');
    const addressVal = textarea.value.trim();
    console.log(addressVal);

    const response = await fetch('/user/addAddress',{
        method: 'POST',
        headers : {
            'Content-Type': 'application/json'
        },
        body: `{ "address" : "${addressVal}"}`
    });
    if(!response.ok){
        console.log("Something Fumbled");
        return;
    }
    console.log(response.json().message);
    return;
}

document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.querySelector('.new-address-container textarea');
    textarea.addEventListener('focus', () => {
        textarea.setSelectionRange(0, 0); // Set the cursor to the start
    });
});