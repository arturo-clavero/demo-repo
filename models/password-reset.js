'use strict'

module.exports = function definePasswordReset (sequelize, DataTypes) {
  const PasswordReset = sequelize.define('PasswordReset', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    // SHA-256 of the emailed token; the token itself is never stored.
    tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    usedAt: { type: DataTypes.DATE, allowNull: true }
  })

  PasswordReset.associate = (db) => {
    PasswordReset.belongsTo(db.User, { foreignKey: 'userId' })
  }

  return PasswordReset
}
