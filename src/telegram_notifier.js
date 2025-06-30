const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message
        });
        console.log('[TELEGRAM][SUCCESS] Pesan terkirim ke Telegram');
    } catch (e) {
        if (e.response && e.response.data) {
            console.error('[TELEGRAM][ERROR]', JSON.stringify(e.response.data));
        } else {
            console.error('[TELEGRAM][ERROR]', e.message);
        }
    }
}

module.exports = { sendTelegramMessage };