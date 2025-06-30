const db = require('./db');
const { connectMikrotik } = require('./mikrotik');
const services = require('./services');
const { sendTelegramMessage } = require('./telegram_notifier');

async function syncVoucherStatus() {
    console.log('[SYNC][DEBUG] Mulai proses sinkronisasi voucher...');
    let conn;
    try {
        // Ambil semua voucher yang statusnya pending/active
        const [vouchers] = await db.execute(
            "SELECT * FROM vouchers WHERE status IN ('pending','active')"
        );
        console.log(`[SYNC][DEBUG] Ditemukan ${vouchers.length} voucher dengan status pending/active.`);

        // Ambil semua user voucher yang masih ada di Mikrotik
        try {
            conn = await connectMikrotik();
            const users = await conn.write('/ip/hotspot/user/print');
            const mikrotikUsernames = users.map(u => u.name);
            console.log(`[SYNC][DEBUG] Ditemukan ${mikrotikUsernames.length} user di Mikrotik.`);

            const now = new Date();

            for (const voucher of vouchers) {
                try {
                    // Jika voucher sudah expired di database, update status ke used
                    if (voucher.expires_at && now > voucher.expires_at && voucher.status !== 'used') {
                        await db.execute(
                            "UPDATE vouchers SET status='used' WHERE id=?",
                            [voucher.id]
                        );
                        console.log(`[SYNC] Voucher ${voucher.voucher_code} expired, status diupdate ke used.`);
                        continue;
                    }

                    // Jika voucher tidak ada di Mikrotik, update status ke used
                    if (!mikrotikUsernames.includes(voucher.voucher_code) && voucher.status !== 'used') {
                        await db.execute(
                            "UPDATE vouchers SET status='used' WHERE id=?",
                            [voucher.id]
                        );
                        console.log(`[SYNC] Voucher ${voucher.voucher_code} tidak ditemukan di Mikrotik, status diupdate ke used.`);
                    }
                } catch (e) {
                    services.logErrorToFile(e);
                    console.error(`[SYNC][ERROR] Gagal sinkron voucher ${voucher.voucher_code}:`, e && e.message ? e.message : e);
                }
            }
        } catch (mikrotikErr) {
            services.logErrorToFile(mikrotikErr);
            console.error('[SYNC][ERROR] Gagal koneksi atau baca user dari Mikrotik:', mikrotikErr && mikrotikErr.message ? mikrotikErr.message : mikrotikErr);
            // Notifikasi admin jika gagal koneksi
            try {
                await sendTelegramMessage(`SYNC ERROR: Gagal koneksi ke Mikrotik: ${mikrotikErr.message}`);
            } catch (e) {
                services.logErrorToFile(e);
            }
        } finally {
            if (conn) {
                try {
                    await conn.close();
                } catch (e) {
                    services.logErrorToFile(e);
                    console.error('[SYNC][ERROR] Gagal menutup koneksi Mikrotik:', e && e.message ? e.message : e);
                }
            }
        }
        console.log('[SYNC] Sinkronisasi voucher selesai.');
    } catch (err) {
        services.logErrorToFile(err);
        console.error('[SYNC ERROR] Proses utama:', err && err.message ? err.message : err);
    }
}

// Jalankan sekali saat startup
syncVoucherStatus();

module.exports = { syncVoucherStatus };
