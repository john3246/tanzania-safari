module.exports = {
  apps: [
    {
      name: 'tanzania-safari',
      cwd: '/var/www/tanzania_safari',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '127.0.0.1'
      }
    }
  ]
};
