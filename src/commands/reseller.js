const db = require('../db');
const { getUserByNumber, updateBalance, createVoucher, recordTransaction, getVoucherPrices, formatMikrotikDuration } = require('../utils');
const { connectMikrotik, createHotspotUser } = require('../mikrotik');
const config = require('../config');
const { sendTelegramMessage } = require('../telegram_notifier');

const handleResellerCommand = async (message, client, resellerUser) => {
    try {
        const text = message.body.toLowerCase().trim();
        const args = text.split(' ');

        // !resell [durasi]
        if (args[0] === '!resell') {
            if (args.length !== 2) {
                await message.reply('Format salah. Gunakan: !resell [3jam/6jam/1hari/1minggu]');
                return;
            }

            const durationKey = args[1];
            const voucherInfoReseller = getVoucherPrices('reseller', durationKey);
            const voucherInfoCustomer = getVoucherPrices('customer', durationKey);

            if (!voucherInfoReseller || !voucherInfoCustomer) {
                await message.reply('Durasi voucher tidak valid. Pilihan: 3jam, 6jam, 1hari, 1minggu.');
                return;
            }

            const priceToReseller = voucherInfoReseller.price;

            if (resellerUser.balance < priceToReseller) {
                await message.reply(`Saldo Anda tidak cukup untuk membeli voucher ${durationKey}. Saldo Anda: Rp. ${parseInt(resellerUser.balance).toLocaleString('id-ID')}. Harga: Rp. ${parseInt(priceToReseller).toLocaleString('id-ID')}`);
                return;
            }

            let conn;
            let voucherData;
            let saldoSudahDipotong = false;
            try {
                conn = await connectMikrotik();
                const mikrotikDuration = formatMikrotikDuration(voucherInfoReseller.duration);

                // 1. Buat voucher di database
                try {
                    voucherData = await createVoucher(durationKey, voucherInfoCustomer.price, priceToReseller, resellerUser.id, voucherInfoReseller.duration);
                } catch (err) {
                    await message.reply('Gagal membuat voucher di database. Saldo Anda tidak terpotong.');
                    return;
                }

                // 2. Buat voucher di Mikrotik
                const creator = resellerUser.username || resellerUser.whatsapp_number;
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
                    await message.reply('Gagal membuat voucher di Mikrotik. Saldo Anda tidak terpotong.');
                    return;
                }

                // 3. Potong saldo reseller
                try {
                    await updateBalance(resellerUser.id, -priceToReseller);
                    saldoSudahDipotong = true;
                } catch (err) {
                    // Rollback database & Mikrotik jika gagal update saldo
                    await db.execute('DELETE FROM vouchers WHERE voucher_code = ?', [voucherData.voucherCode]);
                    // Hapus user di Mikrotik
                    try {
                        const users = await conn.write('/ip/hotspot/user/print', [`?name=${voucherData.voucherCode}`]);
                        if (users.length > 0) {
                            await conn.write('/ip/hotspot/user/remove', [`=.id=${users[0]['.id']}`]);
                        }
                    } catch (e) {}
                    await message.reply('Gagal memotong saldo. Voucher dibatalkan.');
                    return;
                }

                // 4. Catat transaksi
                try {
                    await recordTransaction(resellerUser.id, 'buy', priceToReseller, voucherData.id, null, `Reseller membeli voucher ${durationKey}`);
                } catch (err) {
                    // Refund saldo jika gagal catat transaksi
                    await updateBalance(resellerUser.id, priceToReseller);
                    await db.execute('DELETE FROM vouchers WHERE voucher_code = ?', [voucherData.voucherCode]);
                    // Hapus user di Mikrotik
                    try {
                        const users = await conn.write('/ip/hotspot/user/print', [`?name=${voucherData.voucherCode}`]);
                        if (users.length > 0) {
                            await conn.write('/ip/hotspot/user/remove', [`=.id=${users[0]['.id']}`]);
                        }
                    } catch (e) {}
                    await message.reply('Gagal mencatat transaksi. Voucher dibatalkan dan saldo Anda dikembalikan.');
                    return;
                }

                // 5. Kirim balasan sukses
                await message.reply(
                    `✅ *Voucher ${durationKey.toUpperCase()} berhasil dibeli!*\n` +
                    `🎫 Kode: *${voucherData.voucherCode}*\n` +
                    `💼 Harga Beli (Reseller): Rp. ${parseInt(priceToReseller).toLocaleString('id-ID')}\n` +
                    `💰 Harga Jual ke Pelanggan: Rp. ${parseInt(voucherInfoCustomer.price).toLocaleString('id-ID')}\n` +
                    `💳 Saldo Anda sekarang: Rp. ${(parseInt(resellerUser.balance) - parseInt(priceToReseller)).toLocaleString('id-ID')}\n` +
                    `🚀 Selamat berjualan voucher internet!`
                );

                const groupId = config.groupVoucherId;
                const masaAktif = durationKey.replace('jam', ' Jam').replace('hari', ' Hari').replace('menit', ' Menit').replace('minggu', ' Minggu');
                const kodeVoucher = voucherData.voucherCode;
                const botWaNumber = '6289526591240'; // Ganti dengan nomor WhatsApp bot kamu tanpa +

                const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
                const hariList = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
                const bulanList = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
                const hari = hariList[now.getDay()];
                const tanggal = now.getDate();
                const bulan = bulanList[now.getMonth()];
                const tahun = now.getFullYear();
                const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

                const notif = 
`Transaksi Sukses ✅
= Pembelian Voucher Internet =
    [ 🚀 Voucher (${masaAktif}) 🚀 ]

Rincian Produk
- Layanan       : Voucher Internet 
- Masa Aktif    : ${masaAktif}
- Status        : Sukses ✅
- Harga         : Rp. ${priceToReseller.toLocaleString('id-ID')}
- Kode Voucher  : Cek di pesan pribadi dengan bot
- Tanggal Pembelian : ${hari}, ${tanggal} ${bulan} ${tahun} ${jam} WIB

Contact Person
Whatsapp : https://wa.me/6281288771827`;

                try {
                    await client.sendMessage(groupId, notif);
                } catch (e) {
                    console.error('[GROUP NOTIF ERROR]', e);
                }
            } catch (error) {
                // Deteksi error timeout Mikrotik
                if (error && error.message && error.message.includes('Timed out')) {
                    // Refund saldo jika sudah dipotong
                    if (saldoSudahDipotong) {
                        await updateBalance(resellerUser.id, priceToReseller);
                    }
                    mikrotikBusy = true;
                    pendingUsers.add(resellerUser.whatsapp_number);
                    await message.reply('Server sedang sibuk, silahkan tunggu beberapa saat. Akan diberitahu jika server sudah siap. Saldo Anda tidak terpotong.');
                } else if (saldoSudahDipotong) {
                    await updateBalance(resellerUser.id, priceToReseller);
                    await message.reply('Terjadi kesalahan. Saldo Anda telah dikembalikan.');
                } else {
                    await message.reply('Terjadi kesalahan saat menjual voucher. Pastikan Mikrotik terhubung dan profil hotspot ada.');
                }
            } finally {
                if (conn) conn.close();
            }
            return;
        }

        // !help dan !menu
        if (args[0] === '!help' || args[0] === '!menu') {
            await message.reply(
`*Menu Reseller*
- !resell [3jam/6jam/1hari/1minggu]
- !saldo [nomor_telepon/username]
- !cek [kode_voucher]

Contoh: !resell 1hari`
            );
            return;
        }

        await message.reply('Perintah reseller tidak valid.');
    } catch (err) {
        console.error('[RESELLER CMD ERROR]', err);
        await sendTelegramMessage(`[ERROR][RESELLER] ${resellerUser?.username || resellerUser?.whatsapp_number}: ${err.message}`);
        await message.reply('Terjadi kesalahan internal. Silakan coba lagi atau hubungi admin.');
    }
};

module.exports = { handleResellerCommand };