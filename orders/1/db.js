const { Sequelize } = require('sequelize');

const database = process.env.DATABASE_NAME || 'autonix_order_1';

const sequelize = new Sequelize(database, process.env.DATABASE_USER || 'root', process.env.DATABASE_PASSWORD || '', {
  host: process.env.DATABASE_HOST || '127.0.0.1',
  port: Number(process.env.DATABASE_PORT || 3306),
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,
  },
});

module.exports = { sequelize };
