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

## ��� Struktur Direktori

```bash
wabot-voucher/
├── ecosystem.config.js         # Konfigurasi untuk PM2
├── package.json                # Metadata dan dependensi Node.js
├── public/                     # (Opsional) Panel UI (React/TS)
├── logs/                       # File log sistem
├── README.md                   # Dokumentasi ini
└── src/
    ├── bot.js                  # Inisialisasi WhatsApp Web
    ├── config.js               # File konfigurasi
    ├── db.js                   # Koneksi ke MySQL/MongoDB
    ├── commands/
    │   ├── admin.js            # Perintah untuk Admin
    │   ├── reseller.js         # Perintah untuk Reseller
    │   └── customer.js         # Perintah untuk Customer
    ├── helpers/
    │   └── logger.js           # Logging ke file
    ├── mikrotik.js             # Koneksi ke Router Mikrotik
    ├── services.js             # Layanan utama (topup, generate, cek)
    ├── sync_voucher.js         # Sinkronisasi voucher dari Mikrotik
    ├── telegram_notifier.js    # Kirim notifikasi ke Telegram
    ├── utils/
    │   ├── log.js              # Utilities logging
    │   └── validation.js       # Validasi input
    ├── utils.js                # Fungsi umum
    ├── voucher_cleaner.js      # Auto hapus voucher expired
    └── webhook.js              # Web API untuk integrasi eksternal

