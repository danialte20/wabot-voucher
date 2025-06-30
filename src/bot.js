require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const config = require('./config');
const services = require('./services');
const { registerUser, getUserByNumber, getVoucherByCode } = require('./utils');
const { handleAdminCommand } = require('./commands/admin');
const { handleResellerCommand } = require('./commands/reseller');
const { handleCustomerCommand } = require('./commands/customer');
const { syncVoucherStatus } = require('./sync_voucher');
const mikrotik = require('./mikrotik');
const { sendTelegramMessage } = require('./telegram_notifier');

// Environment variables with defaults
const ADMIN_NUMBER = process.env.ADMIN_NUMBER || '6281288771827@c.us';
const EXECUTABLE_PATH = process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser';
const BROWSER_TIMEOUT = parseInt(process.env.BROWSER_TIMEOUT || '120000', 10); // 120 seconds timeout (increased)

// Rate limiting configuration
const userLastCommand = new Map();
const RATE_LIMIT_MS = 2000;

/**
 * Validates if username meets requirements
 * @param {string} text - Username to validate
 * @returns {boolean} - Whether username is valid
 */
function isValidUsername(text) {
    return /^[a-zA-Z0-9_]{3,}$/.test(text);
}

// Initialize WhatsApp client with improved configuration
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '../.wwebjs_auth') }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--single-process',
            '--disable-extensions',
            '--disable-features=site-per-process',
            '--disable-web-security'
        ],
        executablePath: EXECUTABLE_PATH,
        timeout: BROWSER_TIMEOUT,
        ignoreHTTPSErrors: true
    },
    qrMaxRetries: 5,
    restartOnAuthFail: true,
    disableSpins: true
});

// Register the client with our services module
services.registerBot(client);
services.ADMIN_NUMBER = ADMIN_NUMBER;

// Event handlers
client.on('qr', async (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR code generated. Scan to login.');
    try {
        await sendTelegramMessage('WhatsApp session expired atau perlu login ulang! QR code baru telah di-generate. Silakan scan ulang QR code pada server.');
    } catch (e) {
        services.logErrorToFile(e);
    }
});

client.on('ready', async () => {
    console.log('WhatsApp bot is ready!');
    try {
        await sendTelegramMessage('WhatsApp bot is ready! (BOT sudah online dan siap digunakan)');
    } catch (e) {
        services.logErrorToFile(e);
    }
    
    // Run initial sync
    try {
        await syncVoucherStatus();
    } catch (err) {
        services.logErrorToFile(new Error(`Initial sync failed: ${err.message}`));
    }
    
    // Set up periodic sync (every hour)
    setInterval(() => {
        syncVoucherStatus().catch(err => 
            services.logErrorToFile(new Error(`Scheduled sync failed: ${err.message}`))
        );
    }, 60 * 60 * 1000);
});

client.on('message', async message => {
    console.log('[DEBUG] Pesan diterima:', message.body);
    try {
        // Rate limit implementation
        const now = Date.now();
        const last = userLastCommand.get(message.from) || 0;
        if (now - last < RATE_LIMIT_MS) {
            await message.reply('Please wait before sending another command.');
            return;
        }
        userLastCommand.set(message.from, now);

        const userNumber = message.from;
        const text = message.body.trim();

        // Register new user if needed
        let user = await getUserByNumber(userNumber);
        if (!user) {
            await registerUser(userNumber, 'customer', 0, null);
            await message.reply('Welcome! Please reply with your desired username.');
            return;
        }

        // Handle username registration for new users
        if (!user.username && user.role === 'customer' && !text.startsWith('!')) {
            if (!isValidUsername(text)) {
                await message.reply('Username must contain only letters, numbers, or underscore and be at least 3 characters long. Please try again.');
                return;
            }
            await db.execute('UPDATE users SET username = ? WHERE id = ?', [text, user.id]);
            await message.reply(`Username successfully set to: ${text}`);
            return;
        }

        const role = user.role;

        // Balance check command
        if (text.startsWith('!saldo')) {
            await handleBalanceCheck(message, text, user, role);
            return;
        }

        // Voucher check command
        if (text.startsWith('!cek ')) {
            await handleVoucherCheck(message, text, role);
            return;
        }

        // Role-based command handling
        switch (role) {
            case 'admin':
                await handleAdminCommand(message, client, user);
                break;
            case 'reseller':
                await handleResellerCommand(message, client, user);
                break;
            case 'customer':
                await handleCustomerCommand(message, client, user);
                break;
            default:
                await message.reply('Your role is not recognized. Please contact the administrator.');
        }
    } catch (err) {
        logErrorToFile(err);
        let replyMsg = 'An internal error occurred. Please try again or contact the administrator.';
        
        if (err.code === 'ECONNREFUSED' || (err.message && err.message.includes('connect'))) {
            replyMsg = 'Database connection failed. Please try again later.';
        } else if (err.message && err.message.includes('disconnected')) {
            replyMsg = 'WhatsApp bot is currently disconnected. Please contact the administrator.';
        }
        
        try {
            await message.reply(replyMsg);
        } catch (e) {
            logErrorToFile(e);
        }
    }
});

// Handle balance check functionality
async function handleBalanceCheck(message, text, user, role) {
    let targetIdentifier = text.split(' ')[1];
    let targetUser;
    
    if (targetIdentifier) {
        let normalized = targetIdentifier;
        if (/^\d+$/.test(normalized)) {
            if (normalized.startsWith('0')) normalized = '62' + normalized.substring(1);
            if (!normalized.endsWith('@c.us')) normalized += '@c.us';
        }
        
        targetUser = await getUserByNumber(normalized);
        if (!targetUser) {
            const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [targetIdentifier]);
            if (rows.length > 0) targetUser = rows[0];
        }
        
        if (role !== 'admin' && (!targetUser || targetUser.id !== user.id)) {
            await message.reply('You do not have permission to check another user\'s balance.');
            return;
        }
    } else {
        targetUser = user;
    }
    
    if (targetUser) {
        await message.reply(
            `Balance for ${targetUser.username || targetUser.whatsapp_number}: Rp. ${parseInt(targetUser.balance).toLocaleString('id-ID')}`
        );
    } else {
        await message.reply('User not found.');
    }
}

// Handle voucher check functionality
async function handleVoucherCheck(message, text, role) {
    const voucherCode = text.split(' ')[1];
    if (!voucherCode) {
        await message.reply('Invalid format. Use: !cek [voucher_code]');
        return;
    }
    
    const voucher = await getVoucherByCode(voucherCode.toUpperCase());
    if (!voucher) {
        await message.reply('Voucher not found.');
        return;
    }
    
    let status = '';
    if (voucher.status === 'pending') status = 'Voucher not yet activated.';
    else if (voucher.status === 'active') status = 'Voucher is currently in use.';
    else if (voucher.status === 'used' || voucher.status === 'expired') status = 'Voucher has been used.';

    const toWIB = (date) => date ? new Date(new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })) : '-';
    const formatWIB = (date) => date ? toWIB(date).toLocaleString('id-ID', { hour12: false }) : '-';

    let usageTime = '';
    if (voucher.status === 'active' && voucher.expires_at) {
        const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
        const expires = toWIB(voucher.expires_at);
        let remaining = Math.floor((expires - now) / 1000);
        if (remaining < 0) remaining = 0;
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;
        usageTime = `Usage time: (${hours}h ${minutes}m ${seconds}s)`;
    }

    let response = `🎫 *Voucher Details* ${voucher.voucher_code}\n`;
    response += `📄 Status: ${voucher.status}\n`;
    response += `🗂️ Profile: ${voucher.profile_name}\n`;
    response += `💰 Customer Price: Rp. ${parseInt(voucher.price_customer).toLocaleString('id-ID')}\n`;
    
    if (role === 'admin' || role === 'reseller') {
        response += `💼 Reseller Price: Rp. ${parseInt(voucher.price_reseller).toLocaleString('id-ID')}\n`;
    }
    
    if (voucher.generated_by_user_id) {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [voucher.generated_by_user_id]);
        const creator = rows[0];
        response += `👤 Created by: ${creator?.username || creator?.whatsapp_number || 'N/A'}\n`;
    } else {
        response += `👤 Created by: N/A\n`;
    }
    
    if (voucher.activated_at) {
        response += `⏰ Activated: ${formatWIB(voucher.activated_at)}\n`;
        response += `⏳ Expires: ${formatWIB(voucher.expires_at)}\n`;
        if (usageTime) response += `⏱️ ${usageTime}\n`;
    }
    
    response += `ℹ️ Notes: ${status}\n`;
    await message.reply(response);
}

// Error handling for WhatsApp client
client.on('disconnected', async (reason) => {
    logErrorToFile(new Error(`WhatsApp disconnected: ${reason}`));
    console.error('WhatsApp disconnected:', reason);

    // Kirim notifikasi ke Telegram
    try {
        await sendTelegramMessage(`BOT WhatsApp disconnected: ${reason}`);
    } catch (e) {
        logErrorToFile(e);
    }

    // Attempt to reconnect
    setTimeout(() => {
        console.log('Attempting to reconnect...');
        client.initialize().catch(err => logErrorToFile(err));
    }, 10000);
});

client.on('auth_failure', async (msg) => {
    logErrorToFile(new Error(`WhatsApp auth failure: ${msg}`));
    console.error('WhatsApp auth failure:', msg);

    // Kirim notifikasi ke Telegram
    try {
        await sendTelegramMessage(`BOT WhatsApp authentication failed (kemungkinan sesi expired): ${msg}`);
    } catch (e) {
        logErrorToFile(e);
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    try {
        await client.destroy();
        console.log('WhatsApp client destroyed');
    } catch (e) {
        logErrorToFile(e);
    }
    process.exit(0);
});

// Initialize the client
console.log('Initializing WhatsApp client...');
client.initialize().catch(err => {
    services.logErrorToFile(new Error(`Client initialization error: ${err.message}`));
    console.error('Failed to initialize WhatsApp client:', err);
    
    // Implement retry mechanism with increasing delays
    let retryCount = 0;
    const maxRetries = 5;
    const retryInit = () => {
        if (retryCount < maxRetries) {
            retryCount++;
            const delay = retryCount * 10000; // Increasing delay: 10s, 20s, 30s...
            console.log(`Retrying initialization (${retryCount}/${maxRetries}) in ${delay/1000}s...`);
            setTimeout(() => {
                client.initialize().catch(e => {
                    services.logErrorToFile(new Error(`Retry ${retryCount} failed: ${e.message}`));
                    retryInit();
                });
            }, delay);
        } else {
            console.error(`Failed to initialize after ${maxRetries} attempts. Exiting.`);
            process.exit(1); // Let process manager restart the process
        }
    };
    retryInit();
});

// Create service container after everything is initialized
const botService = {
    client,
    ADMIN_NUMBER,
    mikrotikBusy: false,
    pendingUsers: new Set()
};

let lastActivity = Date.now();
const WATCHDOG_IDLE_MS = 6 * 60 * 60 * 1000; // 6 jam

// Update lastActivity pada event penting
client.on('message', () => { lastActivity = Date.now(); });
client.on('qr', () => { lastActivity = Date.now(); });
client.on('ready', () => { lastActivity = Date.now(); });

// Watchdog timer
setInterval(async () => {
    if (Date.now() - lastActivity > WATCHDOG_IDLE_MS) {
        const msg = `[WATCHDOG] WhatsApp bot idle lebih dari ${WATCHDOG_IDLE_MS/60000} menit. Akan direstart.`;
        console.log(msg);
        await sendTelegramMessage(msg);
        process.exit(1); // PM2 akan restart otomatis
    }
}, 60 * 1000); // cek tiap menit

module.exports = botService;
