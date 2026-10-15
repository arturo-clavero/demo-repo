'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { quote, zoneFor } = require('../services/shipping')

test('zoneFor maps countries to zones', () => {
  assert.equal(zoneFor('ie'), 'domestic')
  assert.equal(zoneFor('ES'), 'eu')
  assert.equal(zoneFor('JP'), 'world')
  assert.equal(zoneFor(undefined), 'world')
})

test('quote charges a base plus a per-item rate', () => {
  assert.deepEqual(quote('IE', 1000, 3), { zone: 'domestic', cents: 550, free: false })
  assert.deepEqual(quote('FR', 1000, 1), { zone: 'eu', cents: 950, free: false })
})

test('quote is free above the zone threshold', () => {
  assert.deepEqual(quote('IE', 5000, 2), { zone: 'domestic', cents: 0, free: true })
  assert.equal(quote('US', 999999, 1).free, false)
})
