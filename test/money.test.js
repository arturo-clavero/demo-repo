'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { toCents, formatCents, percentOf, sumCents } = require('../lib/money')

test('toCents parses whole and decimal amounts', () => {
  assert.equal(toCents('12'), 1200)
  assert.equal(toCents('12.5'), 1250)
  assert.equal(toCents('0.07'), 7)
  assert.equal(toCents(' 3.10 '), 310)
})

test('toCents rejects anything that is not a plain amount', () => {
  for (const bad of ['1e3', '12.345', '-4', 'abc', '', '12,50']) {
    assert.throws(() => toCents(bad), RangeError, bad)
  }
})

test('formatCents formats in the shop currency', () => {
  assert.equal(formatCents(123456), '€1,234.56')
  assert.equal(formatCents(500, 'USD', 'en-US'), '$5.00')
})

test('percentOf rounds to the nearest cent', () => {
  assert.equal(percentOf(999, 10), 100)
  assert.equal(percentOf(1000, 15), 150)
})

test('sumCents multiplies unit price by quantity', () => {
  assert.equal(sumCents([{ unitCents: 250, quantity: 2 }, { unitCents: 99, quantity: 3 }]), 797)
  assert.equal(sumCents([]), 0)
})
