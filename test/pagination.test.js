'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { parsePage, pageMeta, DEFAULT_LIMIT, MAX_LIMIT } = require('../lib/pagination')

test('parsePage uses defaults for a bare request', () => {
  assert.deepEqual(parsePage({}), { page: 1, limit: DEFAULT_LIMIT, offset: 0 })
})

test('parsePage clamps the limit and the page', () => {
  assert.equal(parsePage({ limit: '100000' }).limit, MAX_LIMIT)
  assert.equal(parsePage({ limit: '0' }).limit, 1)
  assert.equal(parsePage({ page: '-3' }).page, 1)
})

test('parsePage computes the offset', () => {
  assert.equal(parsePage({ page: '3', limit: '10' }).offset, 20)
})

test('parsePage ignores junk', () => {
  assert.deepEqual(parsePage({ page: 'x', limit: 'y' }), { page: 1, limit: DEFAULT_LIMIT, offset: 0 })
})

test('pageMeta reports at least one page', () => {
  assert.deepEqual(pageMeta({ page: 1, limit: 20 }, 0), { page: 1, limit: 20, total: 0, pages: 1 })
  assert.equal(pageMeta({ page: 2, limit: 20 }, 41).pages, 3)
})
