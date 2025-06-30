module.exports = {
  apps: [{
    name: 'wabot-voucher',
    script: './src/bot.js',
    instances: 1,
    exec_mode: 'fork',  // Changed to fork for stability with puppeteer
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      CHROMIUM_PATH: '/usr/bin/chromium-browser',
      BROWSER_TIMEOUT: '120000'
    },
    error_file: './logs/pm2/wabot-voucher-error.log',
    out_file: './logs/pm2/wabot-voucher-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }, {
    name: 'wabot-webhook',
    script: './src/webhook.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_restart: 10,  // Limit restarts to detect issues
    cron_restart: '0 */12 * * *',  // Restart every 12 hours
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2/wabot-webhook-error.log',
    out_file: './logs/pm2/wabot-webhook-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }, {
    name: 'wabot-cleaner',
    script: './src/voucher_cleaner.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2/wabot-cleaner-error.log',
    out_file: './logs/pm2/wabot-cleaner-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};