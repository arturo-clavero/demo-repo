'use strict'

const db = require('../models')
const { lastDays } = require('../lib/dates')

const PAID = ['paid', 'shipped']

// Dashboard numbers for the admin home: revenue per day and best sellers.
async function revenueByDay (days = 30) {
  const { from, to } = lastDays(days)
  return db.Order.findAll({
    where: { status: PAID, createdAt: { [db.Op.gte]: from, [db.Op.lt]: to } },
    attributes: [
      [db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'day'],
      [db.sequelize.fn('SUM', db.sequelize.col('totalCents')), 'revenueCents'],
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'orders']
    ],
    group: ['day'],
    order: [['day', 'ASC']],
    raw: true
  })
}

async function bestSellers (limit = 10) {
  return db.OrderItem.findAll({
    attributes: ['productId', 'productName', [db.sequelize.fn('SUM', db.sequelize.col('quantity')), 'sold']],
    include: [{ model: db.Order, attributes: [], where: { status: PAID } }],
    group: ['productId', 'productName'],
    order: [[db.sequelize.literal('sold'), 'DESC']],
    limit,
    raw: true
  })
}

module.exports = { revenueByDay, bestSellers }
