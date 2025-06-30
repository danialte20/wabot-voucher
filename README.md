# WhatsApp Voucher Bot

Sistem bot WhatsApp otomatis untuk manajemen voucher Mikrotik berbasis Node.js. Menggunakan `whatsapp-web.js` dan API Mikrotik untuk mengelola pelanggan, reseller, voucher, dan saldo melalui WhatsApp secara real-time.

[!] Pastikan Anda memahami dasar Node.js, API Mikrotik, dan WhatsApp Web sebelum menggunakan sistem ini.

---

## Fitur Utama

- Autentikasi WhatsApp Web via QR Code
- Generate & hapus voucher Mikrotik langsung dari WhatsApp
- Manajemen saldo untuk Admin, Reseller, dan Customer
- Sinkronisasi otomatis data voucher dari Mikrotik
- Notifikasi transaksi ke Telegram
- Webhook API lokal untuk integrasi eksternal
- Logging aktivitas bot untuk debugging
- Role-based command: Admin, Reseller, Customer

---

## Requirement

- Node.js v16.x atau lebih tinggi
- NPM (Node Package Manager)
- PM2 (untuk production): `npm install -g pm2`
- Router Mikrotik dengan API aktif
- Bot Telegram (opsional, untuk notifikasi)

---

## Instalasi

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

