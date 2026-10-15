'use strict'

const { TokenBucket } = require('../lib/token-bucket')

// Limits by client address. Used on login, register and password reset, the
// three forms a credential-stuffing script hammers.
module.exports = function rateLimit ({ capacity = 10, refillPerSecond = 0.2 } = {}) {
  const bucket = new TokenBucket({ capacity, refillPerSecond })
  return function limit (req, res, next) {
    const key = `${req.ip}:${req.path}`
    if (bucket.take(key)) {
      return next()
    }
    res.set('retry-after', String(bucket.retryAfterSeconds(key)))
    res.status(429).send('Too many attempts, try again shortly')
  }
}
