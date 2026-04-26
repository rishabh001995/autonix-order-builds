require('dotenv').config({ path: require('path').join(__dirname, '.env') });

/** PM2 — set PM2_APP_NAME: autonix-order-8-dev (dev) or autonix-order-8-main (production) in .env */
module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || 'autonix-order-8-dev',
      cwd: __dirname,
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '256M',
      merge_logs: true,
      time: true,
    },
  ],
};
