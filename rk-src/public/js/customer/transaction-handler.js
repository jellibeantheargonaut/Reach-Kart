/* javascript functions to handle transactions */

async function expandTransaction(button){
    const element = button.parentElement;
    element.style.backgroundColor = 'rgba(171, 171, 171, 0.929)';
    element.style.padding = '5px';
    element.style.paddingBottom = '0';

    const transactionDetails = element.querySelector('.transactions-item-details');
    if(transactionDetails.style.display === 'flex'){
        await collapseTransaction(element);
        return;
    }
    transactionDetails.style.display = 'flex';


    const transactionFooter = element.querySelector('.transactions-item-footer');
    transactionFooter.style.display = 'flex';
}

async function collapseTransaction(element){
    element.style.backgroundColor = 'white';
    element.style.padding = '0';

    const transactionDetails = element.querySelector('.transactions-item-details');
    transactionDetails.style.display = 'none';
    const transactionFooter = element.querySelector('.transactions-item-footer');
    transactionFooter.style.display = 'none';
}
async function downloadInvoice(){
    console.log('download invoice');
}
