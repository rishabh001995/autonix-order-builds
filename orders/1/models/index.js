const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Lead = sequelize.define(
  'Lead',
  {
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false },
    company: { type: DataTypes.STRING(200), allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: false },
    source: { type: DataTypes.STRING(80), allowNull: true, defaultValue: 'contact' },
  },
  {
    tableName: 'leads',
    timestamps: true,
    underscored: true,
  }
);

module.exports = { sequelize, Lead };
