'use strict'

module.exports = function defineAddress (sequelize, DataTypes) {
  const Address = sequelize.define('Address', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    label: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'Home' },
    recipient: { type: DataTypes.STRING(120), allowNull: false },
    line1: { type: DataTypes.STRING(160), allowNull: false },
    line2: { type: DataTypes.STRING(160), allowNull: true },
    city: { type: DataTypes.STRING(80), allowNull: false },
    postcode: { type: DataTypes.STRING(16), allowNull: false },
    country: { type: DataTypes.STRING(2), allowNull: false },
    isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  })

  Address.associate = (db) => {
    Address.belongsTo(db.User, { foreignKey: 'userId' })
  }

  return Address
}
