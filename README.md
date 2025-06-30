# � WhatsApp Voucher Bot

Sistem bot WhatsApp otomatis untuk manajemen voucher Mikrotik berbasis Node.js. Menggunakan [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) dan API Mikrotik untuk mengelola pelanggan, reseller, voucher, dan saldo melalui WhatsApp secara real-time.

---

## � Fitur Utama

- � Autentikasi WhatsApp Web via QR code
- �️ Generate dan hapus voucher Mikrotik langsung via WhatsApp
- � Manajemen saldo pelanggan & reseller
- � Sinkronisasi otomatis voucher dari Mikrotik
- � Notifikasi transaksi ke Telegram
- � Webhook dan integrasi eksternal
- � Logging aktivitas bot
- � Role command: Admin, Reseller, Customer

---

## � Struktur Direktori

```bash
wabot-voucher/
├── ecosystem.config.js         # Konfigurasi untuk PM2
├── package.json                # Metadata dan dependensi
├── public/                     # (Opsional) Panel UI (React/TS)
├── logs/                       # File log sistem
├── README.md                   # Dokumentasi ini
└── src/
    ├── bot.js
    ├── config.js
    ├── db.js
    ├── commands/
    │   ├── admin.js
    │   ├── reseller.js
    │   └── customer.js
    ├── helpers/logger.js
    ├── mikrotik.js
    ├── services.js
    ├── sync_voucher.js
    ├── telegram_notifier.js
    ├── utils/
    │   ├── log.js
    │   └── validation.js
    ├── utils.js
    ├── voucher_cleaner.js
    └── webhook.js

⚙️ Instalasi
1. Clone dan Install Dependency
bash
Copy
Edit
git clone https://github.com/danialte20/wabot-voucher.git
cd wabot-voucher
npm install
2. Setup File .env
env
Copy
Edit
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
▶️ Menjalankan Bot
Mode Biasa
bash
Copy
Edit
npm start
Mode PM2 (Produksi)
bash
Copy
Edit
pm2 start ecosystem.config.js
Melihat Log
bash
Copy
Edit
pm2 logs
� Perintah WhatsApp
Admin
!buatvoucher 10 1d — Buat 10 voucher dengan masa aktif 1 hari

!hapusvoucher — Hapus semua voucher aktif

!tambahsaldo 628xxxx 10000 — Tambah saldo ke user

Reseller
!saldo — Lihat saldo reseller

!belivoucher 5 1d — Beli 5 voucher durasi 1 hari

!pelanggan — Lihat daftar pelanggan

Customer
!help — Daftar perintah

!paket — Cek pilihan voucher

!infoakun — Cek informasi akun

� Dependensi Utama
Package	Fungsi
whatsapp-web.js	Integrasi WhatsApp melalui browser headless
puppeteer	Menjalankan Chrome headless
node-routeros	Mengakses API Mikrotik
dotenv	Mengelola variabel lingkungan
axios	HTTP client untuk API eksternal
express	Backend API dan webhook
express-rate-limit	Batasi spam request API
mysql2 / mongoose	Koneksi ke database
qrcode-terminal	Menampilkan QR di terminal

� Testing
bash
Copy
Edit
npm run test
� Kontribusi
Pull request, issue, dan saran sangat diterima!

� Lisensi
MIT License © 2025 — Danial Zulfiqar
