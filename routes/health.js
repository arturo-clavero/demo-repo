'use strict'

const express = require('express')
const db = require('../models')

const router = express.Router()

router.get('/live', (req, res) => res.json({ ok: true }))

// Ready means the database answers. The load balancer stops sending traffic
// to an instance whose pool is broken instead of serving 500s.
router.get('/ready', (req, res) => {
  db.sequelize.authenticate()
    .then(() => res.json({ ok: true }))
    .catch((err) => {
      res.status(503).json({ ok: false, error: err.name })
    })
})

module.exports = router
