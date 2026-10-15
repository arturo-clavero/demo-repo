'use strict'

const db = require('../models')
const { conflict } = require('../lib/http-error')

// Decrements stock only if enough is left, in one UPDATE ... WHERE stock >= n,
// so two concurrent checkouts can never sell the same last unit.
async function reserve (productId, quantity, transaction) {
  const [changed] = await db.Product.update(
    { stock: db.sequelize.literal(`stock - ${Number(quantity)}`) },
    { where: { id: productId, stock: { [db.Op.gte]: quantity } }, transaction }
  )
  if (changed === 0) {
    throw conflict('A product in your cart sold out', 'sold_out')
  }
}

async function release (productId, quantity, transaction) {
  await db.Product.increment('stock', { by: quantity, where: { id: productId }, transaction })
}

async function lowStock (threshold = 5) {
  return db.Product.findAll({ where: { active: true, stock: { [db.Op.lt]: threshold } }, order: [['stock', 'ASC']] })
}

module.exports = { reserve, release, lowStock }
