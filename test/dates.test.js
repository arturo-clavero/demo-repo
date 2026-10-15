'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { parseDay, dayRange, lastDays, DAY_MS } = require('../lib/dates')

test('parseDay accepts ISO days only', () => {
  assert.equal(parseDay('2026-03-01').toISOString(), '2026-03-01T00:00:00.000Z')
  assert.throws(() => parseDay('2026-02-30'), RangeError)
  assert.throws(() => parseDay('01/03/2026'), RangeError)
})

test('dayRange includes the whole last day', () => {
  const { from, to } = dayRange('2026-03-01', '2026-03-31')
  assert.equal(to - from, 31 * DAY_MS)
})

test('dayRange refuses a reversed range', () => {
  assert.throws(() => dayRange('2026-03-02', '2026-03-01'), /ends before/)
})

test('lastDays ends at the next midnight', () => {
  const { from, to } = lastDays(7, new Date('2026-03-10T15:00:00Z'))
  assert.equal(to.toISOString(), '2026-03-11T00:00:00.000Z')
  assert.equal(from.toISOString(), '2026-03-04T00:00:00.000Z')
})
