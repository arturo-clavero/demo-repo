'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { parseCatalog, MAX_ROWS } = require('../lib/catalog-rows')

const file = (value) => Buffer.from(JSON.stringify(value))

test('parses and normalises rows', () => {
  const rows = parseCatalog(file([{ code: 'mug-1', name: 'Mug', price: '4.50', stock: '10', tags: ['kitchen', 'gift'] }]))
  assert.deepEqual(rows, [{ code: 'MUG-1', name: 'Mug', description: null, tags: 'kitchen,gift', priceCents: 450, stock: 10 }])
})

test('refuses a file that is not JSON', () => {
  assert.throws(() => parseCatalog(Buffer.from('{"_$$ND_FUNC$$_": function () {}}')), /not valid JSON/)
})

test('refuses anything but an array, and very large files', () => {
  assert.throws(() => parseCatalog(file({ code: 'A-1' })), /JSON array/)
  assert.throws(() => parseCatalog(file(new Array(MAX_ROWS + 1).fill({}))), /JSON array/)
})

test('names the first bad row', () => {
  assert.throws(() => parseCatalog(file([{ code: 'OK-1', name: 'ok', price: '1' }, { name: 'no code', price: '1' }])), /Row 2/)
})
