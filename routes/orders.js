'use strict'

const express = require('express')
const orders = require('../services/orders')
const orderEmails = require('../services/order-emails')
const asyncHandler = require('../lib/async-handler')
const { parsePage, pageMeta } = require('../lib/pagination')
const { positiveInt } = require('../lib/validate')
const { badRequest } = require('../lib/http-error')

const router = express.Router()
const IDEMPOTENCY_KEY = /^[A-Za-z0-9-]{16,64}$/

router.get('/', asyncHandler(async (req, res) => {
  const page = parsePage(req.query)
  const { rows, count } = await orders.forUser(req.user.id, page)
  res.json({ orders: rows, page: pageMeta(page, count) })
}))

router.get('/:id', asyncHandler(async (req, res) => {
  res.json(await orders.getForUser(req.user.id, positiveInt(req.params.id, 'id')))
}))

router.post('/', asyncHandler(async (req, res) => {
  const key = req.get('idempotency-key')
  if (!IDEMPOTENCY_KEY.test(key || '')) {
    throw badRequest('Send an Idempotency-Key header (16-64 letters, digits or dashes)', 'missing_idempotency_key')
  }
  const order = await orders.checkout(req.user.id, { idempotencyKey: key, couponCode: req.body.coupon })
  const full = await orders.getForUser(req.user.id, order.id)
  await orderEmails.sendConfirmation(req.user, full)
  res.status(201).json(full)
}))

module.exports = router
