const db = require('../db');
const { getUserByNumber, updateBalance, createVoucher, recordTransaction, getVoucherPrices, formatMikrotikDuration } = require('../utils');
const { connectMikrotik, createHotspotUser } = require('../mikrotik');
const config = require('../config');
const { sendTelegramMessage } = require('../telegram_notifier');

const handleAdminCommand = async (message, client, adminUser) => {
    try {
        const text = message.body.toLowerCase().trim();
        const args = text.split(' ');

        // !topup [nomor/username] [jumlah]
        if (args[0] === '!topup') {
            if (args.length !== 3) {
                await message.reply('Format salah. Gunakan: !topup [nomor_telepon_atau_username] [jumlah]');
                return;
            }
            let targetIdentifier = args[1];
            let amount = parseFloat(args[2]);

            // Jika args[1] adalah angka (jumlah), tukar dengan args[2]
            if (!isNaN(parseFloat(args[1])) && isNaN(parseFloat(args[2]))) {
                amount = parseFloat(args[1]);
                targetIdentifier = args[2];
            }

            if (isNaN(amount) || amount <= 0) {
                await message.reply('Jumlah topup harus angka positif.');
                return;
            }

            // Normalisasi nomor
            if (/^\d+$/.test(targetIdentifier)) {
                if (targetIdentifier.startsWith('0')) targetIdentifier = '62' + targetIdentifier.substring(1);
                if (!targetIdentifier.endsWith('@c.us')) targetIdentifier = targetIdentifier + '@c.us';
            }

            let targetUser = await getUserByNumber(targetIdentifier);
            if (!targetUser) {
                const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [args[1]]);
                if (rows.length > 0) targetUser = rows[0];
            }

            if (!targetUser) {
                await message.reply('Pengguna target tidak ditemukan.');
                return;
            }

            await updateBalance(targetUser.id, amount);

            // Ambil saldo terbaru
            const [rows] = await db.execute('SELECT balance FROM users WHERE id = ?', [targetUser.id]);
            const newBalance = rows[0]?.balance || 0;

            await message.reply(`Berhasil topup Rp. ${amount.toLocaleString('id-ID')} ke ${targetUser.username || targetUser.whatsapp_number}. Saldo baru: Rp. ${parseInt(newBalance).toLocaleString('id-ID')}`);
            await client.sendMessage(targetUser.whatsapp_number, `Saldo Anda telah di-topup Rp. ${amount.toLocaleString('id-ID')} oleh admin. Saldo Anda sekarang: Rp. ${parseInt(newBalance).toLocaleString('id-ID')}`);

            return;
        }

        // !buat [durasi]
        if (args[0] === '!buat') {
            if (args.length !== 2) {
                message.reply('Format salah. Gunakan: !buat [3jam/6jam/1hari/1minggu]');
                return;
            }

            const durationKey = args[1];
            const voucherInfo = getVoucherPrices('customer', durationKey);

            if (!voucherInfo) {
                message.reply('Durasi voucher tidak valid. Pilihan: 3jam, 6jam, 1hari, 1minggu.');
                return;
            }

            let conn;
            let voucherData;
            try {
                conn = await connectMikrotik();
                const mikrotikDuration = formatMikrotikDuration(voucherInfo.duration);

                try {
                    voucherData = await createVoucher(
                        durationKey,
                        voucherInfo.price,
                        config.voucherPrices.reseller[durationKey].price,
                        adminUser.id,
                        voucherInfo.duration
                    );
                } catch (err) {
                    message.reply('Gagal membuat voucher di database.');
                    return;
                }

                const creator = adminUser.username || adminUser.whatsapp_number;
                try {
                    await createHotspotUser(
                        voucherData.voucherCode,
                        voucherData.voucherCode,
                        durationKey,
                        mikrotikDuration,
                        creator
                    );
                } catch (err) {
                    // Rollback database jika gagal di Mikrotik
                    await db.execute('DELETE FROM vouchers WHERE voucher_code = ?', [voucherData.voucherCode]);
                    message.reply('Gagal membuat voucher di Mikrotik. Database sudah di-rollback.');
                    return;
                }

                message.reply(
                    `Voucher *${durationKey}* berhasil dibuat!\nKode: *${voucherData.voucherCode}*\nHarga Pelanggan: Rp. ${voucherInfo.price.toLocaleString('id-ID')}\nHarga Reseller: Rp. ${config.voucherPrices.reseller[durationKey].price.toLocaleString('id-ID')}`
                );
                await recordTransaction(adminUser.id, 'create_voucher', 0, voucherData.id, null, `Admin membuat voucher ${durationKey}`);
            } catch (error) {
                message.reply('Terjadi kesalahan saat membuat voucher. Pastikan Mikrotik terhubung dan profil hotspot ada.');
            } finally {
                if (conn) conn.close();
            }
            return;
        }

        // !register [nomor] [username]
        if (args[0] === '!register') {
            if (args.length !== 3) {
                message.reply('Format salah. Gunakan: !register [nomor_telepon] [username]');
                return;
            }
            let nomor = args[1];
            let username = args[2];

            // Normalisasi nomor
            if (nomor.startsWith('0')) nomor = '62' + nomor.substring(1);
            if (!nomor.endsWith('@c.us')) nomor = nomor + '@c.us';

            // Cek apakah user sudah ada
            let user = await getUserByNumber(nomor);
            if (user) {
                message.reply('User sudah terdaftar.');
                return;
            }

            await registerUser(nomor, 'customer', 0, username);
            message.reply(`User ${nomor} berhasil didaftarkan dengan username: ${username}`);
            return;
        }

        // !setusername [nomor/username] [username_baru]
        if (args[0] === '!setusername') {
            if (args.length !== 3) {
                message.reply('Format salah. Gunakan: !setusername [nomor_telepon/username_lama] [username_baru]');
                return;
            }
            let identifier = args[1];
            let newUsername = args[2];

            // Normalisasi nomor jika perlu
            if (/^\d+$/.test(identifier)) {
                if (identifier.startsWith('0')) identifier = '62' + identifier.substring(1);
                if (!identifier.endsWith('@c.us')) identifier = identifier + '@c.us';
            }

            // Cari user by nomor atau username
            let user = await getUserByNumber(identifier);
            if (!user) {
                const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [args[1]]);
                if (rows.length > 0) user = rows[0];
            }
            if (!user) {
                message.reply('User tidak ditemukan.');
                return;
            }

            await db.execute('UPDATE users SET username = ? WHERE id = ?', [newUsername, user.id]);
            message.reply(`Username untuk ${user.whatsapp_number} berhasil diubah menjadi: ${newUsername}`);
            return;
        }

        // !setrole [nomor/username] [role]
        if (args[0] === '!setrole') {
            if (args.length !== 3) {
                message.reply('Format salah. Gunakan: !setrole [nomor_telepon/username] [admin|reseller|customer]');
                return;
            }
            let identifier = args[1];
            let newRole = args[2];

            if (!['admin', 'reseller', 'customer'].includes(newRole)) {
                message.reply('Role tidak valid. Pilihan: admin, reseller, customer.');
                return;
            }

            // Normalisasi nomor jika perlu
            if (/^\d+$/.test(identifier)) {
                if (identifier.startsWith('0')) identifier = '62' + identifier.substring(1);
                if (!identifier.endsWith('@c.us')) identifier = identifier + '@c.us';
            }

            // Cari user by nomor atau username
            let user = await getUserByNumber(identifier);
            if (!user) {
                const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [args[1]]);
                if (rows.length > 0) user = rows[0];
            }
            if (!user) {
                message.reply('User tidak ditemukan.');
                return;
            }

            await db.execute('UPDATE users SET role = ? WHERE id = ?', [newRole, user.id]);
            message.reply(`Role untuk ${user.username || user.whatsapp_number} berhasil diubah menjadi: ${newRole}`);

            // Kirim notifikasi ke user yang diubah
            client.sendMessage(user.whatsapp_number, `Selamat! Role Anda telah diubah menjadi *${newRole}* oleh admin.`);
            return;
        }

        // !kurangi [nomor/username] [jumlah]
        if (args[0] === '!kurangi') {
            if (args.length !== 3) {
                message.reply('Format salah. Gunakan: !kurangi [nomor_telepon/username] [jumlah]');
                return;
            }
            let targetIdentifier = args[1];
            let amount = parseFloat(args[2]);

            if (isNaN(amount) || amount <= 0) {
                message.reply('Jumlah harus angka positif.');
                return;
            }

            // Normalisasi nomor jika perlu
            if (/^\d+$/.test(targetIdentifier)) {
                if (targetIdentifier.startsWith('0')) targetIdentifier = '62' + targetIdentifier.substring(1);
                if (!targetIdentifier.endsWith('@c.us')) targetIdentifier = targetIdentifier + '@c.us';
            }

            // Cari user by nomor atau username
            let targetUser = await getUserByNumber(targetIdentifier);
            if (!targetUser) {
                const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [args[1]]);
                if (rows.length > 0) targetUser = rows[0];
            }
            if (!targetUser) {
                message.reply('Pengguna target tidak ditemukan.');
                return;
            }

            if (targetUser.balance < amount) {
                message.reply('Saldo pengguna tidak cukup untuk dikurangi.');
                return;
            }

            await updateBalance(targetUser.id, -amount);

            // Ambil saldo terbaru
            const [rows] = await db.execute('SELECT balance FROM users WHERE id = ?', [targetUser.id]);
            const newBalance = rows[0]?.balance || 0;

            message.reply(`Saldo ${targetUser.username || targetUser.whatsapp_number} berhasil dikurangi Rp. ${amount.toLocaleString('id-ID')}. Saldo baru: Rp. ${parseInt(newBalance).toLocaleString('id-ID')}`);
            client.sendMessage(targetUser.whatsapp_number, `Saldo Anda telah dikurangi Rp. ${amount.toLocaleString('id-ID')} oleh admin. Saldo Anda sekarang: Rp. ${parseInt(newBalance).toLocaleString('id-ID')}`);
            await recordTransaction(adminUser.id, 'withdraw', amount, null, targetUser.id, `Admin mengurangi saldo`);
            return;
        }

        // !hapusvoucher [kode_voucher]
        if (args[0] === '!hapusvoucher') {
            if (args.length !== 2) {
                message.reply('Format salah. Gunakan: !hapusvoucher [kode_voucher]');
                return;
            }
            const voucherCode = args[1].toUpperCase();

            // Cek di database
            const voucher = await db.execute('SELECT * FROM vouchers WHERE voucher_code = ?', [voucherCode]);
            if (!voucher[0].length) {
                message.reply('Voucher tidak ditemukan di database.');
                return;
            }

            // Hapus di Mikrotik
            try {
                const { connectMikrotik } = require('../mikrotik');
                const conn = await connectMikrotik();
                const users = await conn.write('/ip/hotspot/user/print', [`?name=${voucherCode}`]);
                if (users.length > 0) {
                    await conn.write('/ip/hotspot/user/remove', [`=.id=${users[0]['.id']}`]);
                }
                await conn.close();
            } catch (e) {
                // Jika gagal konek Mikrotik, lanjut hapus di DB
            }

            // Hapus di database
            await db.execute('DELETE FROM vouchers WHERE voucher_code = ?', [voucherCode]);
            message.reply(`Voucher ${voucherCode} berhasil dihapus dari database dan Mikrotik.`);
            return;
        }

        // !hapusdata [nomor/username]
        if (args[0] === '!hapusdata') {
            if (args.length !== 2) {
                message.reply('Format salah. Gunakan: !hapusdata [nomor_telepon/username]');
                return;
            }
            let identifier = args[1];

            // Normalisasi nomor jika perlu
            if (/^\d+$/.test(identifier)) {
                if (identifier.startsWith('0')) identifier = '62' + identifier.substring(1);
                if (!identifier.endsWith('@c.us')) identifier = identifier + '@c.us';
            }

            // Cari user by nomor atau username
            let user = await getUserByNumber(identifier);
            if (!user) {
                const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [args[1]]);
                if (rows.length > 0) user = rows[0];
            }
            if (!user) {
                message.reply('User tidak ditemukan.');
                return;
            }

            await db.execute('DELETE FROM users WHERE id = ?', [user.id]);
            message.reply(`Data user ${user.username || user.whatsapp_number} berhasil dihapus.`);
            return;
        }

        // !help dan !menu
        if (args[0] === '!help' || args[0] === '!menu') {
            await message.reply(
`*Menu Admin*
- !topup [nomor/username] [jumlah]
- !buat [durasi]
- !register [nomor] [username]
- !setusername [nomor/username_lama] [username_baru]
- !setrole [nomor/username] [admin|reseller|customer]
- !kurangi [nomor/username] [jumlah]
- !hapusvoucher [kode_voucher]
- !hapusdata [nomor/username]
- !saldo [nomor/username]
- !cek [kode_voucher]

Contoh: !topup 6281234567890 10000`
            );
            return;
        }

        // Add other admin-specific commands here if needed
        await message.reply('Perintah admin tidak valid.');
    } catch (err) {
        console.error('[ADMIN CMD ERROR]', err);
        await sendTelegramMessage(`[ERROR][ADMIN] ${adminUser?.username || adminUser?.whatsapp_number}: ${err.message}`);
        await message.reply('Terjadi kesalahan internal. Silakan coba lagi atau hubungi admin.');
    }
};

module.exports = { handleAdminCommand };