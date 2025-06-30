const mysql = require('mysql2/promise');
const config = require('./config');

console.log('[DEBUG] Connecting to MySQL:', config.db.host, config.db.user, config.db.database);

const pool = mysql.createPool(config.db);

pool.getConnection()
    .then(conn => {
        console.log('[DEBUG] MySQL connection successful');
        conn.release();
    })
    .catch(err => {
        console.error('[ERROR] MySQL connection failed:', err.message);
    });

module.exports = pool;
