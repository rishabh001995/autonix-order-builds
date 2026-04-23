const { Sequelize } = require('sequelize');

const database = process.env.ORDER_DB_NAME || process.env.DATABASE_NAME || 'autonix_order_4';

const sequelize = new Sequelize(
  database,
  process.env.ORDER_DB_USER || process.env.DATABASE_USER || 'root',
  process.env.ORDER_DB_PASSWORD !== undefined ? process.env.ORDER_DB_PASSWORD : process.env.DATABASE_PASSWORD || '',
  {
    host: process.env.ORDER_DB_HOST || process.env.DATABASE_HOST || '127.0.0.1',
    port: Number(process.env.ORDER_DB_PORT || process.env.DATABASE_PORT || 3306),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      underscored: true,
    },
  }
);

module.exports = { sequelize };
