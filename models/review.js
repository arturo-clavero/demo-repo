'use strict'

module.exports = function defineReview (sequelize, DataTypes) {
  const Review = sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    body: { type: DataTypes.STRING(2000), allowNull: true }
  }, {
    indexes: [{ unique: true, fields: ['userId', 'productId'] }]
  })

  Review.associate = (db) => {
    Review.belongsTo(db.User, { foreignKey: 'userId' })
    Review.belongsTo(db.Product, { foreignKey: 'productId' })
  }

  return Review
}
