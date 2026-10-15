'use strict'

module.exports = function defineCoupon (sequelize, DataTypes) {
  return sequelize.define('Coupon', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING(32), allowNull: false, unique: true },
    percentOff: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 90 } },
    minSubtotalCents: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
    maxUses: { type: DataTypes.INTEGER, allowNull: true },
    uses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  })
}
