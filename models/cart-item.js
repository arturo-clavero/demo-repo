'use strict'

module.exports = function defineCartItem (sequelize, DataTypes) {
  const CartItem = sequelize.define('CartItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 99 } }
  }, {
    indexes: [{ unique: true, fields: ['userId', 'productId'] }]
  })

  CartItem.associate = (db) => {
    CartItem.belongsTo(db.User, { foreignKey: 'userId' })
    CartItem.belongsTo(db.Product, { foreignKey: 'productId' })
  }

  return CartItem
}
