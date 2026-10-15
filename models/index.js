'use strict'

const { Sequelize } = require('sequelize')
const config = require('../config/db')

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, { logging: false })
  : new Sequelize(config.database, config.username, config.password, config)

// Explicit list instead of a directory scan: a stray file in models/ should
// not become a table.
const definitions = [
  require('./user'),
  require('./product'),
  require('./review'),
  require('./cart-item'),
  require('./order'),
  require('./order-item'),
  require('./coupon'),
  require('./password-reset'),
  require('./audit-event'),
  require('./address')
]

const db = {}
for (const define of definitions) {
  const model = define(sequelize, Sequelize.DataTypes)
  db[model.name] = model
}
for (const model of Object.values(db)) {
  if (model.associate) model.associate(db)
}

db.sequelize = sequelize
db.Sequelize = Sequelize
db.Op = Sequelize.Op

module.exports = db
