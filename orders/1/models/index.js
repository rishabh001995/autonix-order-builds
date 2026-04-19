const bcrypt = require('bcryptjs');
const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../db');

const User = sequelize.define(
  'User',
  {
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

User.prototype.setPassword = async function setPassword(plain) {
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(plain, salt);
};

User.prototype.validatePassword = function validatePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

const Testimonial = sequelize.define(
  'Testimonial',
  {
    authorName: { type: DataTypes.STRING(120), allowNull: false, field: 'author_name' },
    roleLocation: { type: DataTypes.STRING(200), allowNull: true, field: 'role_location' },
    body: { type: DataTypes.TEXT, allowNull: false },
    rating: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 5 },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'sort_order' },
  },
  {
    tableName: 'testimonials',
    timestamps: true,
    underscored: true,
  }
);

const BlogPost = sequelize.define(
  'BlogPost',
  {
    slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    excerpt: { type: DataTypes.STRING(500), allowNull: true },
    body: { type: DataTypes.TEXT, allowNull: false },
    publishedAt: { type: DataTypes.DATE, allowNull: false, field: 'published_at' },
  },
  {
    tableName: 'blog_posts',
    timestamps: true,
    underscored: true,
  }
);

module.exports = { sequelize, User, Testimonial, BlogPost, Op };
