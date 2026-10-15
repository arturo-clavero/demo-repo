'use strict'

const express = require('express')
const stats = require('../services/stats')
const inventory = require('../services/inventory')
const asyncHandler = require('../lib/async-handler')

const router = express.Router()

router.get('/', asyncHandler(async (req, res) => {
  const days = Math.min(Number.parseInt(req.query.days, 10) || 30, 365)
  const [revenue, sellers, lowStock] = await Promise.all([
    stats.revenueByDay(days),
    stats.bestSellers(),
    inventory.lowStock()
  ])
  res.json({ revenue, bestSellers: sellers, lowStock })
}))

module.exports = router
