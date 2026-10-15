'use strict'

const db = require('../models')
const inventory = require('./inventory')
const { badRequest, notFound } = require('../lib/http-error')

// Allowed status changes. Anything not listed is refused, so a typo in the
// admin form cannot move a refunded order back to "paid".
const TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'refunded'],
  shipped: ['refunded'],
  cancelled: [],
  refunded: []
}

const RESTOCK = new Set(['cancelled', 'refunded'])

async function setStatus (orderId, status) {
  const order = await db.Order.findOne({ where: { id: orderId }, include: [{ model: db.OrderItem, as: 'items' }] })
  if (!order) throw notFound('No such order')
  const allowed = TRANSITIONS[order.status] || []
  if (!allowed.includes(status)) {
    throw badRequest(`cannot move an order from ${order.status} to ${status}`, 'bad_transition')
  }
  await db.sequelize.transaction(async (transaction) => {
    await order.update({ status }, { transaction })
    if (!RESTOCK.has(status)) return
    for (const item of order.items) {
      await inventory.release(item.productId, item.quantity, transaction)
    }
  })
  return order
}

async function recent ({ status, limit, offset }) {
  const where = status ? { status } : {}
  return db.Order.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit, offset })
}

module.exports = { setStatus, recent, TRANSITIONS }
