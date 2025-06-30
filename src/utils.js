const db = require('./db');
const config = require('./config');
const crypto = require('crypto');

const generateVoucherCode = (profile) => {
    // Ambil prefix: 3j, 6j, 1h, 1m
    let prefix = '';
    if (profile.startsWith('3jam')) prefix = '3j';
    else if (profile.startsWith('6jam')) prefix = '6j';
    else if (profile.startsWith('1hari')) prefix = '1h';
    else if (profile.startsWith('1minggu')) prefix = '1m';
    else prefix = profile.substring(0, 2); // fallback

    // 3 karakter random (huruf besar/kecil/angka)
    const random = crypto.randomBytes(2).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 3);

    // Gabungkan
    return (prefix + random).substring(0, 5);
};

const registerUser = async (whatsappNumber, role = 'customer', initialBalance = 0, username = null) => {
    try {
        await db.execute(
            'INSERT INTO users (whatsapp_number, role, balance, username, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [whatsappNumber, role, initialBalance, username]
        );
        console.log(`User ${whatsappNumber} registered as ${role}.`);
    } catch (error) {
        console.error('Error registering user:', error);
    }
};

const getUserByNumber = async (whatsappNumber) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE whatsapp_number = ?', [whatsappNumber]);
    return rows[0];
};

const getUserRole = async (whatsappNumber) => {
    const user = await getUserByNumber(whatsappNumber);
    return user ? user.role : null;
};

const updateBalance = async (userId, amount) => {
    await db.execute('UPDATE users SET balance = balance + ?, updated_at = NOW() WHERE id = ?', [amount, userId]);
};

const createVoucher = async (profileName, priceCustomer, priceReseller, generatedByUserId, durationMinutes) => {
    const voucherCode = generateVoucherCode(profileName); // gunakan profileName sebagai argumen
    const [result] = await db.execute(
        'INSERT INTO vouchers (voucher_code, profile_name, status, price_customer, price_reseller, generated_by_user_id, valid_for_minutes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [voucherCode, profileName, 'pending', priceCustomer, priceReseller, generatedByUserId, durationMinutes]
    );
    return { id: result.insertId, voucherCode };
};

const getVoucherByCode = async (voucherCode) => {
    const [rows] = await db.execute('SELECT * FROM vouchers WHERE voucher_code = ?', [voucherCode]);
    return rows[0];
};

const updateVoucherStatus = async (voucherId, status, activatedAt = null, expiresAt = null) => {
    await db.execute(
        'UPDATE vouchers SET status = ?, activated_at = ?, expires_at = ?, updated_at = NOW() WHERE id = ?',
        [status, activatedAt, expiresAt, voucherId]
    );
};

const recordTransaction = async (userId, type, amount, voucherId = null, targetUserId = null, description = null) => {
    await db.execute(
        'INSERT INTO transactions (user_id, type, amount, voucher_id, target_user_id, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [userId, type, amount, voucherId, targetUserId, description]
    );
};

const getVoucherPrices = (role, durationKey) => {
    if (config.voucherPrices[role] && config.voucherPrices[role][durationKey]) {
        return config.voucherPrices[role][durationKey];
    }
    return null;
};

const formatMikrotikDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
};

module.exports = {
    generateVoucherCode,
    registerUser,
    getUserByNumber,
    getUserRole,
    updateBalance,
    createVoucher,
    getVoucherByCode,
    updateVoucherStatus,
    recordTransaction,
    getVoucherPrices,
    formatMikrotikDuration
};
