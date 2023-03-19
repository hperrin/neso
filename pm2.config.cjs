require('dotenv').config();
const fs = require('fs');
const path = require('path');

const vars = {
  DOMAIN: process.env.DOMAIN,
  JWT_SECRET: process.env.JWT_SECRET,
  PROD_PORT: process.env.PROD_PORT,
  PORT: process.env.PORT,
  REDIRECT_PORT: process.env.REDIRECT_PORT,
  MYSQL_HOST: process.env.MYSQL_HOST,
  MYSQL_PORT: process.env.MYSQL_PORT,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
  MYSQL_CA_CERT: process.env.MYSQL_CA_CERT_FILE
    ? fs.readFileSync(process.env.MYSQL_CA_CERT_FILE, 'utf8')
    : null,
};

module.exports = {
  apps: [
    {
      name: 'app',
      cwd: path.resolve(__dirname, 'app'),
      script: 'server.js',
      exec_mode: 'cluster',
      instances: 'max',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        CERT: fs.readFileSync(process.env.CERT_FILE, 'utf8'),
        KEY: fs.readFileSync(process.env.KEY_FILE, 'utf8'),
        DH_PARAM: fs.readFileSync(process.env.DH_PARAM_FILE, 'utf8'),
        ...vars,
      },
    },
  ],
};
