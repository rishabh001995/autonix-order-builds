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

const Product = sequelize.define(
  'Product',
  {
    slug: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(160), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    priceCents: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'price_cents' },
    category: { type: DataTypes.STRING(80), allowNull: true, defaultValue: 'produce' },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'sort_order' },
    imageUrl: { type: DataTypes.STRING(512), allowNull: true, field: 'image_url' },
  },
  {
    tableName: 'products',
    timestamps: true,
    underscored: true,
  }
);

const Order = sequelize.define(
  'Order',
  {
    email: { type: DataTypes.STRING(255), allowNull: false },
    fullName: { type: DataTypes.STRING(160), allowNull: false, field: 'full_name' },
    phone: { type: DataTypes.STRING(40), allowNull: true },
    addressLine1: { type: DataTypes.STRING(200), allowNull: false, field: 'address_line1' },
    addressLine2: { type: DataTypes.STRING(200), allowNull: true, field: 'address_line2' },
    city: { type: DataTypes.STRING(120), allowNull: false },
    region: { type: DataTypes.STRING(120), allowNull: true },
    postal: { type: DataTypes.STRING(32), allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true },
    deliveryWindow: { type: DataTypes.STRING(120), allowNull: true, field: 'delivery_window' },
    totalCents: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'total_cents' },
    status: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'received' },
  },
  {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  }
);

const OrderItem = sequelize.define(
  'OrderItem',
  {
    orderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'order_id' },
    productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'product_id' },
    productName: { type: DataTypes.STRING(160), allowNull: false, field: 'product_name' },
    unitPriceCents: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'unit_price_cents' },
    quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  },
  {
    tableName: 'order_items',
    timestamps: true,
    underscored: true,
  }
);

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = { sequelize, Lead, Product, Order, OrderItem };
