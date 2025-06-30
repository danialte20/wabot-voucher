# Ì¥ñ WhatsApp Voucher Bot

Sistem bot WhatsApp otomatis untuk manajemen voucher Mikrotik berbasis Node.js. Menggunakan `whatsapp-web.js` dan API Mikrotik untuk mengelola pelanggan, reseller, voucher, dan saldo melalui WhatsApp secara real-time.

‚ö†Ô∏è **Pastikan Anda memahami dasar Node.js, API Mikrotik, dan WhatsApp Web sebelum menggunakan sistem ini.**

---

## ‚ú® Fitur Utama

- ‚úÖ Autentikasi WhatsApp Web via QR Code
- ÌæüÔ∏è Generate & hapus voucher Mikrotik langsung dari WhatsApp
- Ì≤∞ Manajemen saldo untuk Admin, Reseller, dan Customer
- Ì¥Ñ Sinkronisasi otomatis data voucher dari Mikrotik
- Ì≥¢ Notifikasi transaksi ke Telegram
- Ì¥ó Webhook API lokal untuk integrasi eksternal
- Ì≥Å Logging aktivitas bot untuk debugging
- Ì¥ê Role-based command: Admin, Reseller, Customer

---

## Ì≥¶ Requirement

- Node.js v16.x atau lebih tinggi
- NPM (Node Package Manager)
- PM2 (untuk production): `npm install -g pm2`
- Router Mikrotik dengan API aktif
- Bot Telegram (opsional, untuk notifikasi)

---

## ‚öôÔ∏è Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/username/wabot-voucher.git
cd wabot-voucher

# 2. Instal dependensi
npm install

# 3. Konfigurasi file
# Edit file konfigurasi sesuai kebutuhan di:
src/config.js

# 4. Jalankan aplikasi
npm start

# Untuk production (pakai PM2)
pm2 start ecosystem.config.js

