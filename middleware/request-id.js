'use strict'

const crypto = require('crypto')

const INCOMING = /^[A-Za-z0-9-]{8,64}$/

// Reuses the proxy's X-Request-Id when it looks sane, otherwise makes one.
module.exports = function requestId (req, res, next) {
  const incoming = req.get('x-request-id')
  req.id = INCOMING.test(incoming || '') ? incoming : crypto.randomUUID()
  res.set('x-request-id', req.id)
  next()
}
