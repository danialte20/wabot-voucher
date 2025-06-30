# ��� WhatsApp Voucher Bot

Sistem bot WhatsApp otomatis untuk manajemen voucher Mikrotik berbasis Node.js. Menggunakan [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) dan API Mikrotik untuk mengelola pelanggan, reseller, voucher, dan saldo melalui WhatsApp secara real-time.

---

## ��� Fitur Utama

- ��� Autentikasi WhatsApp Web via QR code
- ���️ Generate dan hapus voucher Mikrotik langsung via WhatsApp
- ��� Manajemen saldo pelanggan & reseller
- ��� Sinkronisasi otomatis voucher dari Mikrotik
- ��� Notifikasi transaksi ke Telegram
- ��� Webhook dan integrasi eksternal
- ��� Logging aktivitas bot
- ��� Role command: Admin, Reseller, Customer

---

## ��� Struktur Direktori

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

