'use strict'

const express = require('express')
const reportsClient = require('../services/reports-client')
const audit = require('../services/audit')
const asyncHandler = require('../lib/async-handler')
const { badRequest } = require('../lib/http-error')

const router = express.Router()
const KINDS = new Set(['orders', 'products', 'customers'])

// Exports are built by the Python worker; this route only forwards the
// request and polls its status.
router.post('/', asyncHandler(async (req, res) => {
  const kind = String(req.body.kind || '')
  if (!KINDS.has(kind)) throw badRequest(`kind must be one of ${[...KINDS].join(', ')}`, 'bad_kind')
  const job = await reportsClient.requestExport(kind, { from: req.body.from, to: req.body.to })
  await audit.record(req.user.id, 'export.request', `export:${job.id}`, { kind })
  res.status(202).json(job)
}))

router.get('/:id', asyncHandler(async (req, res) => {
  res.json(await reportsClient.exportStatus(req.params.id))
}))

module.exports = router
