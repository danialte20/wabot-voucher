module.exports = {
    db: {
        host: 'localhost',
        user: 'wabot_user',
        password: 'lastcode97',
        database: 'wabot_voucher_db'
    },
    mikrotik: {
        host: '10.70.77.1',
        username: 'admin',
        password: 'passwd',
        port: 8728
    },
    voucherPrices: {
        customer: {
            '1menit': { price: 0, duration: 1 },      // 1 menit, gratis
            '1jam':   { price: 1000, duration: 60 },  // 1 jam
            '3jam':   { price: 2000, duration: 180 },
            '6jam':   { price: 3000, duration: 360 },
            '1hari':  { price: 5000, duration: 1440 },
            '1minggu':{ price: 15000, duration: 10080 }
        },
        reseller: {
            '1menit': { price: 0, duration: 1 },      // 1 menit, gratis
            '1jam':   { price: 500, duration: 60 },   // 1 jam
            '3jam':   { price: 1000, duration: 180 },
            '6jam':   { price: 1500, duration: 360 },
            '1hari':  { price: 3000, duration: 1440 },
            '1minggu':{ price: 10000, duration: 10080 }
        }
    },
    adminNumbers: ['6281288771827@c.us'],
    groupVoucherId: '120363417205349810@g.us'
};
