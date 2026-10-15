'use strict'

const express = require('express')
const products = require('../services/products')
const reviews = require('../services/reviews')
const asyncHandler = require('../lib/async-handler')
const { parsePage, pageMeta } = require('../lib/pagination')
const { positiveInt } = require('../lib/validate')

const router = express.Router()

router.get('/', asyncHandler(async (req, res) => {
  const page = parsePage(req.query)
  const { rows, count } = await products.list({ term: req.query.q, ...page })
  res.render('app/products', { output: { products: rows, searchTerm: req.query.q, page: pageMeta(page, count) } })
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'id')
  const [product, average] = await Promise.all([products.get(id), reviews.averageRating(id)])
  const { rows } = await reviews.forProduct(id, parsePage(req.query))
  res.json({ product, average, reviews: rows })
}))

router.post('/:id/reviews', asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'id')
  await products.get(id)
  const review = await reviews.upsert(req.user.id, id, req.body)
  res.status(201).json(review)
}))

module.exports = router
