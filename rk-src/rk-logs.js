/* module for log file operations */
const fs = require('fs');
const path = require('path');

// function to create lof files and folder
async function RKLogInit() {
    const logDir = path.join(__dirname, 'logs');
    if(!fs.existsSync(logDir)){
        fs.mkdirSync(logDir);
    }
    
    const rk_chainpi = path.join(logDir, 'rk-chainapi.log');
    const rk_userops = path.join(logDir, 'rk-userops.log');
    const rk_sellerops = path.join(logDir, 'rk-sellerops.log');
    const rk_logging = path.join(logDir, 'rk-logging.log');
    const rk_error = path.join(logDir, 'rk-error.log');

    // create files if they don't exist
    [rk_chainpi, rk_userops, rk_sellerops, rk_logging, rk_error].forEach((file) => {
        if(!fs.existsSync(file)){
            fs.writeFileSync(file, '');
        }
    });
    console.log('[rk-logs ] 📁 Log files created')
}

// function to write log to a file
async function RKWriteLog(message, module){
    const logDir = path.join(__dirname, 'logs');
    if(!fs.existsSync(logDir)){
        fs.mkdirSync(logDir);
    }
    switch(module){
        case 'rk-chainapi':
            fs.appendFileSync(path.join(logDir, 'rk-chainapi.log'), `[${await formatDate(Date.now())}]        ${message}\n`);
            break;
        case 'rk-userops':
            fs.appendFileSync(path.join(logDir, 'rk-userops.log'), `[${await formatDate(Date.now())}]        ${message}\n`);
            break;
        case 'rk-sellerops':
            fs.appendFileSync(path.join(logDir, 'rk-sellerops.log'), `[${await formatDate(Date.now())}]        ${message}\n`);
            break;
        case 'rk-logging':
            fs.appendFileSync(path.join(logDir, 'rk-logging.log'), `[${await formatDate(Date.now())}]        ${message}\n`);
            break;
        case 'rk-error':
            fs.appendFileSync(path.join(logDir,'rk-error.log'), `[${await formatDate(Date.now())}]        ${message}\n`);
        default:
            fs.appendFileSync(path.join(logDir, 'rk-logging.log'), `[${await formatDate(Date.now())}]        ${message}\n`);
            break;
    }
}

async function RKClearLogs(){
    const logDir = path.join(__dirname, 'logs');
    if(fs.existsSync(logDir)){
        fs.rmdirSync(logDir, {recursive: true});
        console.log('[rk-logs ] 📁 Log files cleared');
    }
}

async function formatDate(timestamp){
    const date = new Date(timestamp)
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}
module.exports = {
    RKLogInit,
    RKWriteLog,
    RKClearLogs
}