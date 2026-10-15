'use strict'

// The headers helmet would set for this app, without the dependency.
const HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'same-origin',
  'cross-origin-opener-policy': 'same-origin',
  'content-security-policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'"
}

module.exports = function securityHeaders (req, res, next) {
  res.set(HEADERS)
  res.removeHeader('x-powered-by')
  next()
}
