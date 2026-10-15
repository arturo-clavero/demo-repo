'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { normaliseAddress, formatAddress } = require('../lib/address')

const valid = { recipient: 'Ana Lopez', line1: '12 Main St', city: 'Cork', postcode: 'T12 X2Y3', country: 'ie' }

test('normalises a valid address and drops unknown fields', () => {
  const address = normaliseAddress({ ...valid, userId: 99, isDefault: true })
  assert.equal(address.country, 'IE')
  assert.equal(address.label, 'Home')
  assert.equal(address.userId, undefined)
  assert.equal(address.isDefault, undefined)
})

test('lists the missing fields', () => {
  assert.throws(() => normaliseAddress({ recipient: 'Ana' }), /missing: line1, city, postcode, country/)
})

test('validates country and postcode', () => {
  assert.throws(() => normaliseAddress({ ...valid, country: 'Ireland' }), /two-letter/)
  assert.throws(() => normaliseAddress({ ...valid, postcode: '<script>' }), /postcode/)
})

test('formats an address on separate lines without empty ones', () => {
  assert.equal(formatAddress(normaliseAddress(valid)), 'Ana Lopez\n12 Main St\nT12 X2Y3 Cork\nIE')
})
