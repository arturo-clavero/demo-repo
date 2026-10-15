'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { newToken, hashToken, sameToken, TOKEN_BYTES } = require('../lib/tokens')

test('newToken is url-safe and long enough', () => {
  const token = newToken()
  assert.match(token, /^[A-Za-z0-9_-]+$/)
  assert.equal(Buffer.from(token, 'base64url').length, TOKEN_BYTES)
})

test('newToken does not repeat', () => {
  const seen = new Set(Array.from({ length: 200 }, newToken))
  assert.equal(seen.size, 200)
})

test('hashToken is a stable sha256 hex digest', () => {
  assert.equal(hashToken('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  assert.notEqual(hashToken('abc'), hashToken('abd'))
})

test('sameToken compares in constant time and handles length mismatch', () => {
  assert.ok(sameToken('token-1', 'token-1'))
  assert.ok(!sameToken('token-1', 'token-2'))
  assert.ok(!sameToken('short', 'longer-token'))
})
