'use strict'

const db = require('../models')
const cart = require('./cart')
const coupons = require('./coupons')
const inventory = require('./inventory')
const { sumCents } = require('../lib/money')
const { badRequest, notFound } = require('../lib/http-error')
const { ServiceError } = require('../lib/service-error')

function lineItems (cartItems) {
  return cartItems.map((item) => ({
    productId: item.Product.id,
    productName: item.Product.name,
    unitCents: item.Product.priceCents,
    quantity: item.quantity
  }))
}

async function pricing (items, couponCode) {
  const subtotalCents = sumCents(items)
  const applied = couponCode ? await coupons.discountFor(couponCode, subtotalCents) : null
  const discountCents = applied ? applied.discountCents : 0
  return { subtotalCents, discountCents, totalCents: subtotalCents - discountCents, coupon: applied && applied.coupon }
}

async function placeOrder (transaction, userId, idempotencyKey, items, price) {
  for (const item of items) {
    await inventory.reserve(item.productId, item.quantity, transaction)
  }
  const order = await db.Order.create({
    userId,
    idempotencyKey,
    subtotalCents: price.subtotalCents,
    discountCents: price.discountCents,
    totalCents: price.totalCents,
    couponCode: price.coupon ? price.coupon.code : null,
    items
  }, { include: [{ model: db.OrderItem, as: 'items' }], transaction })
  if (price.coupon) await coupons.redeem(price.coupon, transaction)
  await cart.clear(userId, transaction)
  return order
}

// Checkout is idempotent on the client's key: a retried request (double click,
// flaky network) returns the order the first request created.
async function checkout (userId, { idempotencyKey, couponCode }) {
  const existing = await db.Order.findOne({ where: { userId, idempotencyKey } })
  if (existing) return existing
  const items = lineItems(await cart.items(userId))
  if (items.length === 0) throw badRequest('Your cart is empty', 'empty_cart')
  const price = await pricing(items, couponCode)
  try {
    return await db.sequelize.transaction((t) => placeOrder(t, userId, idempotencyKey, items, price))
  } catch (err) {
    if (err.status) throw err
    throw new ServiceError('checkout failed', { cause: err })
  }
}

async function forUser (userId, { limit, offset }) {
  return db.Order.findAndCountAll({ where: { userId }, order: [['createdAt', 'DESC']], limit, offset })
}

async function getForUser (userId, id) {
  const order = await db.Order.findOne({ where: { id, userId }, include: [{ model: db.OrderItem, as: 'items' }] })
  if (!order) throw notFound('No such order')
  return order
}

module.exports = { checkout, forUser, getForUser, pricing, lineItems }
