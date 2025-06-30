/**
 * Shared services to break circular dependencies
 */

// Logger configuration
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
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

// Central service container that will be updated by bot.js
const services = {
    client: null,
    ADMIN_NUMBER: process.env.ADMIN_NUMBER || '6281288771827@c.us',
    logErrorToFile,
    registerBot: (botClient) => {
        services.client = botClient;
    }
};

module.exports = services;