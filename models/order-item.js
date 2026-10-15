'use strict'

module.exports = function defineOrderItem (sequelize, DataTypes) {
  const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unitCents: { type: DataTypes.INTEGER, allowNull: false },
    productName: { type: DataTypes.STRING(160), allowNull: false }
  })

  OrderItem.associate = (db) => {
    OrderItem.belongsTo(db.Order, { foreignKey: 'orderId' })
    OrderItem.belongsTo(db.Product, { foreignKey: 'productId' })
  }

  return OrderItem
}
