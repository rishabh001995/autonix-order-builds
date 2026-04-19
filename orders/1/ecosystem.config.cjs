require('dotenv').config({ path: require('path').join(__dirname, '.env') });

/** PM2 ecosystem — set PM2_APP_NAME (e.g. autonix-order-1-dev or autonix-order-1-main) in .env per environment */
module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || 'autonix-order-1-dev',
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
