'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { toCsv, cell } = require('../lib/csv')

test('cell quotes commas, quotes and newlines', () => {
  assert.equal(cell('a,b'), '"a,b"')
  assert.equal(cell('say "hi"'), '"say ""hi"""')
  assert.equal(cell('two\nlines'), '"two\nlines"')
})

test('cell neutralises spreadsheet formulas', () => {
  assert.equal(cell('=1+1'), "'=1+1")
  assert.equal(cell('@SUM(A1)'), "'@SUM(A1)")
  assert.equal(cell('-5'), "'-5")
})

test('cell prints null and undefined as empty', () => {
  assert.equal(cell(null), '')
  assert.equal(cell(undefined), '')
})

test('toCsv writes a header and one line per row', () => {
  const columns = [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }]
  const csv = toCsv(columns, [{ code: 'A-1', name: 'Mug' }, { code: 'B-2', name: 'Tea, green' }])
  assert.equal(csv, 'Code,Name\nA-1,Mug\nB-2,"Tea, green"\n')
})
