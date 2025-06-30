const db = require('../db');
const { getUserByNumber, updateBalance, createVoucher, recordTransaction, getVoucherPrices, formatMikrotikDuration } = require('../utils');
const { connectMikrotik, createHotspotUser } = require('../mikrotik');
const config = require('../config');
const { sendTelegramMessage } = require('../telegram_notifier');

const handleCustomerCommand = async (message, client, customerUser) => {
    try {
        const text = message.body.toLowerCase().trim();
        const args = text.split(' ');

        // !beli [durasi]
        if (args[0] === '!beli') {
            if (args.length !== 2) {
                message.reply('Format salah. Gunakan: !beli [3jam/6jam/1hari/1minggu]');
                return;
            }

            const durationKey = args[1];
            const voucherInfo = getVoucherPrices('customer', durationKey);

            if (!voucherInfo) {
                message.reply('Durasi voucher tidak valid. Pilihan: 3jam, 6jam, 1hari, 1minggu.');
                return;
            }

            const price = voucherInfo.price;

            if (customerUser.balance < price) {
                message.reply(`Saldo Anda tidak cukup untuk membeli voucher ${durationKey}. Saldo Anda: Rp. ${customerUser.balance.toLocaleString('id-ID')}. Harga: Rp. ${price.toLocaleString('id-ID')}`);
                return;
            }

            let conn;
            let voucherData;
            let saldoSudahDipotong = false;
            try {
                conn = await connectMikrotik();
                const mikrotikDuration = formatMikrotikDuration(voucherInfo.duration);

                try {
                    voucherData = await createVoucher(durationKey, price, price, customerUser.id, voucherInfo.duration);
                } catch (err) {
                    message.reply('Gagal membuat voucher di database. Saldo Anda tidak terpotong.');
                    return;
                }

                const creator = customerUser.username || customerUser.whatsapp_number;
                try {
                    await createHotspotUser(
                        voucherData.voucherCode,
                        voucherData.voucherCode,
                        durationKey,
                        mikrotikDuration,
                        creator
                    );
                } catch (err) {
                    // Rollback database dan refund saldo
                    await db.execute('DELETE FROM vouchers WHERE voucher_code = ?', [voucherData.voucherCode]);
                    message.reply('Gagal membuat voucher di Mikrotik. Saldo Anda akan dikembalikan.');
                    return;
                }

                await updateBalance(customerUser.id, -price);
                saldoSudahDipotong = true;
                await recordTransaction(customerUser.id, 'buy', price, voucherData.id, null, `Pelanggan membeli voucher ${durationKey}`);

                message.reply(
                    `✅ *Voucher ${durationKey.toUpperCase()} berhasil dibeli!*\n` +
                    `🎫 Kode: *${voucherData.voucherCode}*\n` +
                    `💰 Harga: Rp. ${price.toLocaleString('id-ID')}\n` +
                    `💳 Saldo Anda sekarang: Rp. ${(customerUser.balance - price).toLocaleString('id-ID')}\n` +
                    `🚀 Selamat menggunakan layanan internet Myesnet!`
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
- Harga         : Rp. ${price.toLocaleString('id-ID')}
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
                // Refund saldo jika sudah dipotong
                if (saldoSudahDipotong) {
                    await updateBalance(customerUser.id, price);
                    await message.reply('Terjadi kesalahan. Saldo Anda telah dikembalikan.');
                } else {
                    // Deteksi error timeout Mikrotik
                    if (error && error.message && error.message.includes('Timed out')) {
                        if (saldoSudahDipotong) {
                            await updateBalance(customerUser.id, price);
                        }
                        mikrotikBusy = true;
                        pendingUsers.add(customerUser.whatsapp_number);
                        await message.reply('Server sedang sibuk, silahkan tunggu beberapa saat. Akan diberitahu jika server sudah siap. Saldo Anda tidak terpotong.');
                    } else if (saldoSudahDipotong) {
                        await updateBalance(customerUser.id, price);
                        await message.reply('Terjadi kesalahan. Saldo Anda telah dikembalikan.');
                    } else {
                        await message.reply('Terjadi kesalahan saat membeli voucher. Pastikan Mikrotik terhubung dan profil hotspot ada.');
                    }
                }
            } finally {
                if (conn) conn.close();
            }
            return;
        }

        // !help dan !menu
        if (args[0] === '!help' || args[0] === '!menu') {
            await message.reply(
`*Menu Pelanggan*
- !beli [3jam/6jam/1hari/1minggu]
- !saldo
- !cek [kode_voucher]

Contoh: !beli 3jam`
            );
            return;
        }

        await message.reply('Perintah pelanggan tidak valid.');
    } catch (err) {
        console.error('[CUSTOMER CMD ERROR]', err);
        await sendTelegramMessage(`[ERROR][CUSTOMER] ${customerUser?.username || customerUser?.whatsapp_number}: ${err.message}`);
        await message.reply('Terjadi kesalahan internal. Silakan coba lagi atau hubungi admin.');
    }
};

module.exports = { handleCustomerCommand };