module.exports = {
  apps: [
    {
      name: 'bot',
      watch: false,
      autorestart: true,
      log: './logs/app-bot.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      script: 'dist/main.mjs',
    },
  ],
}
