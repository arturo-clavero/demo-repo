'use strict'

const crypto = require('crypto')

const TOKEN_BYTES = 32

// Password reset and email confirmation tokens: 256 random bits, sent to the
// user once. Only the SHA-256 of a token is stored, so a database leak does not
// leak usable links.
function newToken () {
  return crypto.randomBytes(TOKEN_BYTES).toString('base64url')
}

function hashToken (token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex')
}

function sameToken (a, b) {
  const left = Buffer.from(String(a))
  const right = Buffer.from(String(b))
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

module.exports = { newToken, hashToken, sameToken, TOKEN_BYTES }
