const fs = require('fs');
const path = require('path');

// Configure logging
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

/**
 * Logs error to file with timestamp
 * @param {Error|string} error - Error to log
 */
function logErrorToFile(error) {
    try {
        const logPath = path.join(logDir, 'error.log');
        const logMsg = `[${new Date().toISOString()}] ${error?.stack || error}\n`;
        fs.appendFileSync(logPath, logMsg);
        console.error(`[ERROR] ${error?.message || error}`);
    } catch (e) {
        console.error('Failed to write error log:', e);
    }
}

module.exports = { logErrorToFile };