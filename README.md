# ��� WhatsApp Voucher Bot

Sistem bot WhatsApp otomatis untuk manajemen voucher Mikrotik berbasis Node.js. Menggunakan [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) dan API Mikrotik untuk mengelola pelanggan, reseller, voucher, dan saldo melalui WhatsApp secara real-time.

---

## ��� Fitur Utama

- ��� Autentikasi WhatsApp Web via QR code
- ���️ Generate dan hapus voucher Mikrotik langsung via WhatsApp
- ��� Manajemen saldo pelanggan & reseller
- ��� Sinkronisasi otomatis data voucher dari Mikrotik
- ��� Notifikasi transaksi ke Telegram
- ⚙️ API lokal untuk integrasi webhook dan layanan eksternal
- ��� Logging aktivitas bot
- ��� Role command: Admin, Reseller, Customer

---

## ���️ Struktur Direktori

wabot-voucher/
├── ecosystem.config.js # Konfigurasi untuk PM2
├── package.json # Metadata dan dependensi Node.js
├── public/ # (Opsional) Panel UI (React/TS)
├── logs/ # File log sistem
├── README.md # Dokumentasi ini
└── src/
├── bot.js # Inisialisasi WhatsApp Web
├── config.js # File konfigurasi
├── db.js # Koneksi ke MySQL/MongoDB
├── commands/
│ ├── admin.js # Perintah untuk Admin
│ ├── reseller.js # Perintah untuk Reseller
│ └── customer.js # Perintah untuk Customer
├── helpers/
│ └── logger.js # Logging ke file
├── mikrotik.js # Koneksi ke Router Mikrotik
├── services.js # Layanan utama (topup, generate, cek)
├── sync_voucher.js # Sinkronisasi voucher dari Mikrotik
├── telegram_notifier.js # Kirim notifikasi ke Telegram
├── utils/
│ ├── log.js # Utilities logging
│ ├── validation.js # Validasi input
├── utils.js # Fungsi umum
├── voucher_cleaner.js # Auto hapus voucher expired
└── webhook.js # Web API untuk integrasi eksternal


---

## ⚙️ Instalasi

### 1. Clone dan Install Dependency

```bash
git clone https://github.com/danialte20/wabot-voucher.git
cd wabot-voucher
npm install


2. Setup File .env
Buat file .env di root direktori dengan format seperti berikut:

BOT_NAME=WabotVoucher
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=wabot_db
MIKROTIK_HOST=192.168.88.1
MIKROTIK_USER=admin
MIKROTIK_PASS=admin123
TELEGRAM_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

��� Menjalankan Bot

Mode Biasa
npm start

Mode PM2 (rekomendasi untuk produksi)
pm2 start ecosystem.config.js

Untuk melihat log:
pm2 logs

��� Dependensi Utama
| Package               | Fungsi                                      |
| --------------------- | ------------------------------------------- |
| `whatsapp-web.js`     | Integrasi WhatsApp melalui browser headless |
| `puppeteer`           | Menjalankan Chrome headless                 |
| `node-routeros`       | Mengakses API Mikrotik                      |
| `dotenv`              | Mengelola variabel lingkungan               |
| `axios`               | HTTP client untuk API eksternal             |
| `express`             | Backend API dan webhook                     |
| `express-rate-limit`  | Batasi spam request API                     |
| `mysql2` / `mongoose` | Database                                    |
| `qrcode-terminal`     | Menampilkan QR di terminal                  |



��� Lisensi
MIT License © 2025 — Danial Zulfiqar
