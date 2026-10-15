'use strict'

module.exports = function defineAuditEvent (sequelize, DataTypes) {
  return sequelize.define('AuditEvent', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    actorId: { type: DataTypes.INTEGER, allowNull: true },
    action: { type: DataTypes.STRING(64), allowNull: false },
    subject: { type: DataTypes.STRING(128), allowNull: true },
    detail: { type: DataTypes.JSON, allowNull: true }
  }, { updatedAt: false })
}
