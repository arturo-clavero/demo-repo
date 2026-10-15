'use strict'

module.exports = function defineUser (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    login: { type: DataTypes.STRING(32), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(254), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(72), allowNull: false },
    role: { type: DataTypes.ENUM('customer', 'staff', 'admin'), allowNull: false, defaultValue: 'customer' },
    lastLoginAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    defaultScope: { attributes: { exclude: ['password'] } },
    scopes: { withPassword: { attributes: { include: ['password'] } } }
  })

  User.associate = (db) => {
    User.hasMany(db.Order, { foreignKey: 'userId' })
    User.hasMany(db.CartItem, { foreignKey: 'userId' })
    User.hasMany(db.Review, { foreignKey: 'userId' })
  }

  User.prototype.toJSON = function toJSON () {
    const { password, ...safe } = this.get()
    return safe
  }

  return User
}
