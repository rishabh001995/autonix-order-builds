/** PM2 ecosystem — app name: autonix-order-1 */
module.exports = {
  apps: [
    {
      name: 'autonix-order-1',
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
