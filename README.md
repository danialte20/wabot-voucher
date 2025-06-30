WhatsApp Voucher Bot Ì≥±

Sistem bot WhatsApp otomatis untuk manajemen voucher Mikrotik berbasis Node.js. Menggunakan whatsapp-web.js dan API Mikrotik untuk mengelola pelanggan, reseller, voucher, dan saldo melalui WhatsApp secara real-time.

‚ö†Ô∏è Pastikan Anda sudah memahami konsep dasar Node.js, Mikrotik API, dan WhatsApp Web sebelum menggunakan sistem ini.

Ì¥ß Fitur Utama

- Autentikasi WhatsApp Web via QR Code
- Generate & Hapus voucher Mikrotik langsung dari WhatsApp
- Manajemen saldo untuk Admin, Reseller, dan Customer
- Sinkronisasi otomatis data voucher dari Mikrotik
- Notifikasi transaksi ke Telegram
- Webhook API lokal untuk integrasi eksternal
- Logging aktivitas bot untuk debugging
- Role-based command: Admin, Reseller, Customer

Ì∑∞ Requirement

- Node.js v16.x atau lebih tinggi
- NPM (Node Package Manager)
- PM2 (untuk produksi): npm install -g pm2
- Router Mikrotik dengan API aktif
- Bot Telegram untuk notifikasi (opsional)

Ìª† Installasi

1. Clone repositori:
   git clone https://github.com/username/wabot-voucher.git 
   cd wabot-voucher

2. Instal dependensi:
   npm install

3. Konfigurasi file:
   - Ubah sesuai kebutuhan di src/config.js

4. Jalankan aplikasi:
   npm start
   Atau gunakan PM2 untuk production:
   pm2 start ecosystem.config.js

Ì≥ñ Cara Penggunaan

1. Jalankan bot, lalu scan QR Code WhatsApp Web yang ditampilkan.
2. Kirim pesan ke bot WhatsApp dengan format perintah sesuai role:
   - /topup 10000 (Customer)
   - /addvoucher 1 jam 10MB (Admin/Reseller)
   - /saldo (Semua role)

3. Semua aktivitas akan tercatat di folder logs/.
4. Notifikasi transaksi bisa dikirim ke Telegram jika sudah disetup.

Ì¥ù Kontribusi

Kontribusi sangat diterima! Silakan buka issue atau pull request di GitHub.

Ì≤° Lisensi

MIT License - lihat file LICENSE untuk detail.
