'use strict'

const STATUSES = ['pending', 'paid', 'shipped', 'cancelled', 'refunded']

module.exports = function defineOrder (sequelize, DataTypes) {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    status: { type: DataTypes.ENUM(...STATUSES), allowNull: false, defaultValue: 'pending' },
    subtotalCents: { type: DataTypes.INTEGER, allowNull: false },
    discountCents: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    totalCents: { type: DataTypes.INTEGER, allowNull: false },
    couponCode: { type: DataTypes.STRING(32), allowNull: true },
    idempotencyKey: { type: DataTypes.STRING(64), allowNull: false, unique: true }
  })

  Order.associate = (db) => {
    Order.belongsTo(db.User, { foreignKey: 'userId' })
    Order.hasMany(db.OrderItem, { foreignKey: 'orderId', as: 'items' })
  }

  Order.STATUSES = STATUSES
  return Order
}
