# í¿¢ WhatsApp Voucher Bot

Sistem bot WhatsApp otomatis untuk manajemen voucher Mikrotik berbasis Node.js. Menggunakan [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) dan API Mikrotik untuk mengelola pelanggan, reseller, voucher, dan saldo melalui WhatsApp secara real-time.

---

## íº€ Fitur Utama

- í´ Autentikasi WhatsApp Web via QR code
- í¾Ÿï¸ Generate dan hapus voucher Mikrotik langsung via WhatsApp
- í²° Manajemen saldo pelanggan & reseller
- í´„ Sinkronisasi otomatis voucher dari Mikrotik
- í´” Notifikasi transaksi ke Telegram
- í¼ Webhook dan integrasi eksternal
- í³ Logging aktivitas bot
- í±¥ Role command: Admin, Reseller, Customer

---

## í³ Struktur Direktori

```bash
wabot-voucher/
â”œâ”€â”€ ecosystem.config.js         # Konfigurasi untuk PM2
â”œâ”€â”€ package.json                # Metadata dan dependensi
â”œâ”€â”€ public/                     # (Opsional) Panel UI (React/TS)
â”œâ”€â”€ logs/                       # File log sistem
â”œâ”€â”€ README.md                   # Dokumentasi ini
â””â”€â”€ src/
    â”œâ”€â”€ bot.js
    â”œâ”€â”€ config.js
    â”œâ”€â”€ db.js
    â”œâ”€â”€ commands/
    â”‚   â”œâ”€â”€ admin.js
    â”‚   â”œâ”€â”€ reseller.js
    â”‚   â””â”€â”€ customer.js
    â”œâ”€â”€ helpers/logger.js
    â”œâ”€â”€ mikrotik.js
    â”œâ”€â”€ services.js
    â”œâ”€â”€ sync_voucher.js
    â”œâ”€â”€ telegram_notifier.js
    â”œâ”€â”€ utils/
    â”‚   â”œâ”€â”€ log.js
    â”‚   â””â”€â”€ validation.js
    â”œâ”€â”€ utils.js
    â”œâ”€â”€ voucher_cleaner.js
    â””â”€â”€ webhook.js

âš™ï¸ Instalasi
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
â–¶ï¸ Menjalankan Bot
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
í²¬ Perintah WhatsApp
Admin
!buatvoucher 10 1d â€” Buat 10 voucher dengan masa aktif 1 hari

!hapusvoucher â€” Hapus semua voucher aktif

!tambahsaldo 628xxxx 10000 â€” Tambah saldo ke user

Reseller
!saldo â€” Lihat saldo reseller

!belivoucher 5 1d â€” Beli 5 voucher durasi 1 hari

!pelanggan â€” Lihat daftar pelanggan

Customer
!help â€” Daftar perintah

!paket â€” Cek pilihan voucher

!infoakun â€” Cek informasi akun

í³¦ Dependensi Utama
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

í·ª Testing
bash
Copy
Edit
npm run test
í´ Kontribusi
Pull request, issue, dan saran sangat diterima!

í³„ Lisensi
MIT License Â© 2025 â€” Danial Zulfiqar
