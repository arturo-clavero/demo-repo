'use strict'

module.exports = function defineProduct (sequelize, DataTypes) {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING(32), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(160), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    tags: { type: DataTypes.STRING(255), allowNull: true },
    priceCents: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  })

  Product.associate = (db) => {
    Product.hasMany(db.Review, { foreignKey: 'productId' })
    Product.hasMany(db.OrderItem, { foreignKey: 'productId' })
  }

  return Product
}
