'use strict'

const express = require('express')
const products = require('../services/products')
const users = require('../services/users')
const orderAdmin = require('../services/order-admin')
const catalogImport = require('../services/catalog-import')
const upstreamCheck = require('../services/upstream-check')
const audit = require('../services/audit')
const orderEmails = require('../services/order-emails')
const asyncHandler = require('../lib/async-handler')
const { toCents } = require('../lib/money')
const { parsePage, pageMeta } = require('../lib/pagination')
const { positiveInt } = require('../lib/validate')
const { badRequest } = require('../lib/http-error')

const router = express.Router()

router.get('/', (req, res) => res.render('app/admin', { admin: true }))

router.get('/users', asyncHandler(async (req, res) => {
  const page = parsePage(req.query)
  const { rows, count } = await users.listUsers(page)
  res.json({ users: rows, page: pageMeta(page, count) })
}))

router.post('/products', asyncHandler(async (req, res) => {
  const id = req.body.id ? positiveInt(req.body.id, 'id') : null
  const product = await products.save(id, { ...req.body, priceCents: toCents(req.body.price), stock: Number(req.body.stock) })
  await audit.record(req.user.id, 'product.save', `product:${product.id}`)
  req.flash('success', 'Product saved')
  res.redirect('/app/products')
}))

router.post('/products/:id/retire', asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'id')
  await products.retire(id)
  await audit.record(req.user.id, 'product.retire', `product:${id}`)
  res.status(204).end()
}))

router.post('/products/import', asyncHandler(async (req, res) => {
  const file = req.files && req.files.products
  if (!file) throw badRequest('Attach a JSON file named "products"', 'no_file')
  const count = await catalogImport.importProducts(file.data)
  await audit.record(req.user.id, 'product.import', null, { count })
  res.json({ imported: count })
}))

router.get('/orders', asyncHandler(async (req, res) => {
  const page = parsePage(req.query)
  const { rows, count } = await orderAdmin.recent({ status: req.query.status, ...page })
  res.json({ orders: rows, page: pageMeta(page, count) })
}))

router.post('/orders/:id/status', asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'id')
  const order = await orderAdmin.setStatus(id, String(req.body.status))
  await audit.record(req.user.id, 'order.status', `order:${id}`, { status: order.status })
  if (order.status === 'shipped') {
    await orderEmails.sendShipped(await users.findById(order.userId), order)
  }
  res.json(order)
}))

router.post('/diagnostics/ping', asyncHandler(async (req, res) => {
  res.json(await upstreamCheck.ping(String(req.body.host || '')))
}))

router.get('/audit', asyncHandler(async (req, res) => {
  const page = parsePage(req.query)
  const { rows, count } = await audit.recent(page)
  res.json({ events: rows, page: pageMeta(page, count) })
}))

module.exports = router
