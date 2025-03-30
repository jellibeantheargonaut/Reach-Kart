/* javascript functions for admin page */


async function deselectButtons(){
    let buttons = document.querySelectorAll('.navbar-button');
    buttons.forEach(button => {
        button.classList.remove('button-selected');
    });
}

async function selectButton(button){
    await deselectButtons();
    button.classList.add('button-selected');
}

async function blankPanels() {
    const loggingPanel = document.querySelector('.logging-panel');
    const userOpsPanel = document.querySelector('.userops-panel');
    const sellerOpsPanel = document.querySelector('.sellerops-panel');
    const chainApiPanel = document.querySelector('.chainapi-panel');
    const errorPanel = document.querySelector('.error-panel');
    const terminalPanel = document.querySelector('.terminal-panel');
    [ loggingPanel, userOpsPanel, sellerOpsPanel, chainApiPanel, errorPanel, terminalPanel ].forEach(panel => {
        panel.style.display = 'none';
    });
}

async function showLogging(button){
    await selectButton(button);
    await blankPanels();
    const loggingPanel = document.querySelector('.logging-panel');
    loggingPanel.style.display = 'flex';
}

async function showUserOps(button){
    await selectButton(button);
    await blankPanels();
    const userOpsPanel = document.querySelector('.userops-panel');
    userOpsPanel.style.display = 'flex';
}

async function showSellerOps(button){
    await selectButton(button);
    await blankPanels();
    const sellerOpsPanel = document.querySelector('.sellerops-panel');
    sellerOpsPanel.style.display = 'flex';
}

async function showChainApi(button){
    await selectButton(button);
    await blankPanels();
    const chainApiPanel = document.querySelector('.chainapi-panel');
    chainApiPanel.style.display = 'flex';
}

async function showError(button){
    await selectButton(button);
    await blankPanels();
    const errorPanel = document.querySelector('.error-panel');
    errorPanel.style.display = 'flex';
}

async function showTerminal(button){
    await selectButton(button);
    await blankPanels();
    const terminalPanel = document.querySelector('.terminal-panel');
    terminalPanel.style.display = 'flex';
}

// function to read stream from event source
async function realTimeLogs() {
    const loggingModule = 'rk-logging';
    const useropsModule = 'rk-userops';
    const selleropsModule = 'rk-sellerops';
    const chainapiModule = 'rk-chainapi';
    const errorModule = 'rk-error';

    // logging
    const loggingEvent = new EventSource(`https://reach-kart.onrender.com/logs/${loggingModule}`);
    loggingEvent.onmessage = (event) => {
        const loggingPanel = document.querySelector('.logging-panel');
        //loggingPanel.innerHTML = '';
        const log = document.createElement('p');
        log.textContent = event.data;
        loggingPanel.appendChild(log);
    };

    // userops
    const useropsEvent = new EventSource(`https://reach-kart.onrender.com/logs/${useropsModule}`);
    useropsEvent.onmessage = (event) => {
        const useropsPanel = document.querySelector('.userops-panel');
        //useropsPanel.innerHTML = '';
        const log = document.createElement('p');
        log.textContent = event.data;
        useropsPanel.appendChild(log);
    };

    // sellerops
    const selleropsEvent = new EventSource(`https://reach-kart.onrender.com/logs/${selleropsModule}`);
    selleropsEvent.onmessage = (event) => {
        const selleropsPanel = document.querySelector('.sellerops-panel');
        //selleropsPanel.innerHTML = '';
        const log = document.createElement('p');
        log.textContent = event.data;
        selleropsPanel.appendChild(log);
    };

    // chainapi
    const chainapiEvent = new EventSource(`https://reach-kart.onrender.com/logs/${chainapiModule}`);
    chainapiEvent.onmessage = (event) => {
        const chainapiPanel = document.querySelector('.chainapi-panel');
        //chainapiPanel.innerHTML = '';
        const log = document.createElement('p');
        log.textContent = event.data;
        chainapiPanel.appendChild(log);
    };
}

document.addEventListener('DOMContentLoaded', async () => {
    await realTimeLogs();

    // set up a websocket
    const ws = new WebSocket('https://reach-kart:onrender.com:8888');
    ws.onopen = () => {
        console.log('connected to websocket');
    };
    ws.onmessage = (event) => {
        const terminalPanel = document.querySelector('.terminal-output-container');
        terminalPanel.innerHTML += event.data.replace(/\n/g, '<br>');
        terminalInput.scrollTop = terminalInput.scrollHeight;
    };
    ws.onclose = () => {
        console.log('disconnected from websocket');
    };

    async function sendCommand(command) {
        ws.send(command);
    }

    const terminalInput = document.querySelector('.terminal-input-container');
    terminalInput.addEventListener('keyup', async (event) => {
        const commandInput = document.getElementById('terminal-input');
        if (event.key === 'Enter') {
            await sendCommand(commandInput.value);
            commandInput.value = '';
        }
    });
});