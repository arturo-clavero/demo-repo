'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { safeRedirectPath } = require('../lib/safe-redirect')

test('keeps same-site paths', () => {
  assert.equal(safeRedirectPath('/app/orders?page=2'), '/app/orders?page=2')
})

test('rejects other origins and tricks', () => {
  for (const target of ['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '']) {
    assert.equal(safeRedirectPath(target), '/app/products', target)
  }
})

test('rejects non-strings', () => {
  assert.equal(safeRedirectPath(undefined, '/home'), '/home')
  assert.equal(safeRedirectPath(['/a']), '/app/products')
})
