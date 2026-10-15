'use strict'

const db = require('../models')
const products = require('./products')
const { badRequest } = require('../lib/http-error')

const MAX_QUANTITY = 99

async function items (userId) {
  return db.CartItem.findAll({
    where: { userId },
    include: [{ model: db.Product, attributes: ['id', 'name', 'priceCents', 'stock'] }],
    order: [['createdAt', 'ASC']]
  })
}

async function setQuantity (userId, productId, quantity) {
  if (quantity > MAX_QUANTITY) throw badRequest(`at most ${MAX_QUANTITY} of one product`, 'too_many')
  const product = await products.get(productId)
  if (product.stock < quantity) throw badRequest('not enough stock', 'out_of_stock')
  await db.CartItem.upsert({ userId, productId, quantity })
}

async function remove (userId, productId) {
  await db.CartItem.destroy({ where: { userId, productId } })
}

async function clear (userId, transaction) {
  await db.CartItem.destroy({ where: { userId }, transaction })
}

module.exports = { items, setQuantity, remove, clear, MAX_QUANTITY }
