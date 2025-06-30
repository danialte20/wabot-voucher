const fs = require('fs');
const path = require('path');

function logErrorToFile(error) {
    try {
        const logDir = path.join(__dirname, '../../logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
        const logPath = path.join(logDir, 'error.log');
        const logMsg = `[${new Date().toISOString()}] ${error.stack || error}\n`;
        fs.appendFileSync(logPath, logMsg);
    } catch (e) {
        console.error('Gagal menulis log error:', e);
    }
}

module.exports = { logErrorToFile };
