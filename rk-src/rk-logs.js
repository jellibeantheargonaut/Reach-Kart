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

    // create files if they don't exist
    [rk_chainpi, rk_userops, rk_sellerops, rk_logging].forEach((file) => {
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
            fs.appendFileSync(path.join(logDir, 'rk-chainapi.log'), `[${new Date(Date.now()).toISOString()}] ${message}\n`);
            break;
        case 'rk-userops':
            fs.appendFileSync(path.join(logDir, 'rk-userops.log'), `[${new Date(Date.now()).toISOString()}] ${message}\n`);
            break;
        case 'rk-sellerops':
            fs.appendFileSync(path.join(logDir, 'rk-sellerops.log'), `[${new Date(Date.now()).toISOString()}] ${message}\n`);
            break;
        case 'rk-logging':
            fs.appendFileSync(path.join(logDir, 'rk-logging.log'), `[${new Date(Date.now()).toISOString()}] ${message}\n`);
            break;
        default:
            fs.appendFileSync(path.join(logDir, 'rk-logging.log'), `[${new Date(Date.now()).toISOString()}] ${message}\n`);
            break;
    }
}

module.exports = {
    RKLogInit,
    RKWriteLog
}