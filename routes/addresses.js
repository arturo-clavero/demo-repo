'use strict'

const express = require('express')
const addresses = require('../services/addresses')
const shipping = require('../services/shipping')
const asyncHandler = require('../lib/async-handler')
const { positiveInt } = require('../lib/validate')

const router = express.Router()

router.get('/', asyncHandler(async (req, res) => {
  res.json(await addresses.list(req.user.id))
}))

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await addresses.add(req.user.id, req.body))
}))

router.put('/:id', asyncHandler(async (req, res) => {
  res.json(await addresses.update(req.user.id, positiveInt(req.params.id, 'id'), req.body))
}))

router.post('/:id/default', asyncHandler(async (req, res) => {
  res.json(await addresses.makeDefault(req.user.id, positiveInt(req.params.id, 'id')))
}))

router.delete('/:id', asyncHandler(async (req, res) => {
  await addresses.remove(req.user.id, positiveInt(req.params.id, 'id'))
  res.status(204).end()
}))

// Shipping quote for the cart page, by the country of a saved address.
router.get('/:id/shipping', asyncHandler(async (req, res) => {
  const address = await addresses.get(req.user.id, positiveInt(req.params.id, 'id'))
  const subtotalCents = positiveInt(req.query.subtotalCents, 'subtotalCents')
  const items = positiveInt(req.query.items, 'items')
  res.json(shipping.quote(address.country, subtotalCents, items))
}))

module.exports = router
