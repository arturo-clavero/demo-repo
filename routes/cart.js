'use strict'

const express = require('express')
const cart = require('../services/cart')
const { sumCents } = require('../lib/money')
const asyncHandler = require('../lib/async-handler')
const { positiveInt } = require('../lib/validate')

const router = express.Router()

router.get('/', asyncHandler(async (req, res) => {
  const items = await cart.items(req.user.id)
  const lines = items.map((item) => ({ unitCents: item.Product.priceCents, quantity: item.quantity }))
  res.json({ items, subtotalCents: sumCents(lines) })
}))

router.put('/:productId', asyncHandler(async (req, res) => {
  const productId = positiveInt(req.params.productId, 'productId')
  await cart.setQuantity(req.user.id, productId, positiveInt(req.body.quantity, 'quantity'))
  res.status(204).end()
}))

router.delete('/:productId', asyncHandler(async (req, res) => {
  await cart.remove(req.user.id, positiveInt(req.params.productId, 'productId'))
  res.status(204).end()
}))

module.exports = router
