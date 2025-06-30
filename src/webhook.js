require('dotenv').config();
const express = require('express');
const db = require('./db');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Configure logging
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

function logToFile(message, type = 'info') {
    try {
        const logPath = path.join(logDir, 'webhook.log');
        const timestamp = new Date().toISOString();
        const logMsg = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
        fs.appendFileSync(logPath, logMsg);
        
        if (type === 'error') {
            console.error(`[${type.toUpperCase()}] ${message}`);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    } catch (e) {
        console.error('Failed to write log:', e);
    }
}

// Initialize Express
const app = express();

// Add security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
});

// Parse request bodies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limit all requests
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Max 100 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later'
});
app.use(limiter);

// Simple health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'up', timestamp: new Date().toISOString() });
});

// Main voucher login endpoint with robust error handling
app.post('/voucher-login', async (req, res) => {
    try {
        const { voucher_code } = req.body;
        logToFile(`Received voucher login request: ${voucher_code}`);
        
        if (!voucher_code) {
            logToFile(`Missing voucher_code in request`, 'warn');
            return res.status(400).json({ error: 'voucher_code required' });
        }
        
        // Set a timeout for the database query
        const queryTimeout = setTimeout(() => {
            logToFile(`Database query timeout for voucher: ${voucher_code}`, 'error');
            return res.status(408).json({ error: 'Database query timeout' });
        }, 5000); // 5 second timeout
        
        try {
            // Cek voucher status
            const [rows] = await db.execute('SELECT * FROM vouchers WHERE voucher_code = ?', [voucher_code]);
            
            // Clear the timeout as query completed
            clearTimeout(queryTimeout);
            
            const voucher = rows[0];
            if (!voucher) {
                logToFile(`Voucher not found: ${voucher_code}`, 'warn');
                return res.status(404).json({ error: 'Voucher not found' });
            }
            
            if (voucher.status === 'pending') {
                const activatedAt = new Date();
                const expiresAt = new Date(activatedAt.getTime() + voucher.valid_for_minutes * 60000);
                
                await db.execute(
                    "UPDATE vouchers SET status='active', activated_at=?, expires_at=? WHERE id=?",
                    [activatedAt, expiresAt, voucher.id]
                );
                
                logToFile(`Voucher ${voucher_code} activated via login`);
            }
            
            res.status(200).json({ status: 'OK', message: 'Voucher processed successfully' });
        } catch (dbError) {
            // Clear timeout if there was a DB error
            clearTimeout(queryTimeout);
            
            logToFile(`Database error: ${dbError.message}`, 'error');
            res.status(500).json({ error: 'Database error' });
        }
    } catch (err) {
        logToFile(`Unexpected error: ${err.message}`, 'error');
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    logToFile(`Unhandled error: ${err.message}`, 'error');
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    logToFile(`Not found: ${req.method} ${req.url}`, 'warn');
    res.status(404).json({ error: 'Not found' });
});

// Start server with graceful shutdown
const PORT = process.env.WEBHOOK_PORT || 3001;
const server = app.listen(PORT, () => {
    logToFile(`Webhook server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
    logToFile('Shutting down webhook server...', 'info');
    server.close(() => {
        logToFile('Webhook server closed.', 'info');
        process.exit(0);
    });
    
    // Force close if not closed within 10 seconds
    setTimeout(() => {
        logToFile('Forcing webhook server shutdown...', 'warn');
        process.exit(1);
    }, 10000);
}

// Uncaught exception handler
process.on('uncaughtException', (err) => {
    logToFile(`Uncaught exception: ${err.message}`, 'error');
    shutdown();
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason) => {
    logToFile(`Unhandled promise rejection: ${reason}`, 'error');
});
