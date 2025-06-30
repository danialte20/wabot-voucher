const db = require('./db');
const { connectMikrotik, deleteHotspotUser } = require('./mikrotik');

async function cleanExpiredVouchers() {
    console.log('[CLEANER][DEBUG] Mulai proses pembersihan voucher expired/used...');
    try {
        // Ambil voucher yang sudah expired (status active, waktu habis)
        const [vouchers] = await db.execute(
            "SELECT * FROM vouchers WHERE status='active' AND expires_at IS NOT NULL AND expires_at < NOW()"
        );
        console.log(`[CLEANER][DEBUG] Ditemukan ${vouchers.length} voucher active yang expired.`);
        if (vouchers.length === 0) return;

        for (const voucher of vouchers) {
            try {
                console.log(`[CLEANER] Proses voucher: ${voucher.voucher_code}, status: ${voucher.status}, expires_at: ${voucher.expires_at}`);
                // Update status voucher menjadi used
                await db.execute(
                    "UPDATE vouchers SET status='used' WHERE id=?",
                    [voucher.id]
                );
                console.log(`[CLEANER] Status voucher ${voucher.voucher_code} diupdate ke used`);
                await deleteHotspotUser(voucher.voucher_code);
                console.log(`[CLEANER] Voucher ${voucher.voucher_code} dihapus dari Mikrotik`);
            } catch (e) {
                console.error(`[CLEANER][ERROR] Gagal hapus voucher ${voucher.voucher_code} di Mikrotik:`, e && e.message ? e.message : e);
            }
        }

        // Hapus voucher dari database yang expired lebih dari 7 hari
        const [delResult] = await db.execute(
            "DELETE FROM vouchers WHERE (status='used' OR status='expired') AND expires_at IS NOT NULL AND expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY)"
        );
        console.log(`[CLEANER][DEBUG] Voucher expired >7 hari dihapus dari database.`);
    } catch (err) {
        console.error('[CLEANER ERROR] Proses utama:', err && err.message ? err.message : err);
    }

    // Hapus voucher status used/expired yang masih ada di Mikrotik
    try {
        // Ambil semua voucher used/expired yang belum lebih dari 7 hari
        const [usedVouchers] = await db.execute(
            "SELECT * FROM vouchers WHERE (status='used' OR status='expired') AND expires_at IS NOT NULL AND expires_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        );
        console.log(`[CLEANER][DEBUG] Ditemukan ${usedVouchers.length} voucher used/expired untuk dicek di Mikrotik.`);
        if (usedVouchers.length > 0) {
            let conn;
            try {
                conn = await connectMikrotik();
                const users = await conn.write('/ip/hotspot/user/print');
                const mikrotikUsernames = users.map(u => u.name);
                for (const voucher of usedVouchers) {
                    if (mikrotikUsernames.includes(voucher.voucher_code)) {
                        try {
                            console.log(`[CLEANER][DEBUG] Akan hapus voucher ${voucher.voucher_code} dari Mikrotik`);
                            await deleteHotspotUser(voucher.voucher_code);
                            console.log(`[CLEANER] Voucher ${voucher.voucher_code} (used/expired) dihapus dari Mikrotik`);
                        } catch (e) {
                            console.error(`[CLEANER][ERROR] Gagal hapus voucher ${voucher.voucher_code} (used/expired) di Mikrotik:`, e && e.message ? e.message : e);
                        }
                    } else {
                        console.log(`[CLEANER][DEBUG] Voucher ${voucher.voucher_code} tidak ditemukan di Mikrotik`);
                    }
                }
            } catch (e) {
                console.error('[CLEANER][ERROR] Koneksi Mikrotik:', e && e.message ? e.message : e);
            } finally {
                if (conn) {
                    try {
                        await conn.close();
                    } catch (e) {
                        console.error('[CLEANER][ERROR] Gagal menutup koneksi Mikrotik:', e && e.message ? e.message : e);
                    }
                }
            }
        }
    } catch (e) {
        console.error('[CLEANER][ERROR] Error saat hapus voucher used/expired di Mikrotik:', e && e.message ? e.message : e);
    }
    console.log('[CLEANER][DEBUG] Selesai proses pembersihan voucher expired/used.');
}

// Jalankan setiap 5 menit
setInterval(cleanExpiredVouchers, 5 * 60 * 1000);
console.log('Voucher cleaner started...');