'use strict'

const { toCents } = require('./money')
const { badRequest } = require('./http-error')

const MAX_ROWS = 500
const CODE = /^[A-Z0-9-]{3,32}$/

// Parses a product import (JSON array). The file is treated as data:
// JSON.parse with no reviver, then every row is validated before the caller
// writes anything.
function parseCatalog (buffer) {
  let rows
  try {
    rows = JSON.parse(buffer.toString('utf8'))
  } catch (err) {
    throw badRequest('The file is not valid JSON', 'bad_json')
  }
  if (!Array.isArray(rows) || rows.length > MAX_ROWS) {
    throw badRequest(`Expected a JSON array of at most ${MAX_ROWS} products`, 'bad_shape')
  }
  return rows.map(toProduct)
}

function toProduct (row, index) {
  const code = String(row.code || '').toUpperCase()
  if (!CODE.test(code) || !row.name) {
    throw badRequest(`Row ${index + 1}: code and name are required`, 'bad_row')
  }
  return {
    code,
    name: String(row.name).slice(0, 160),
    description: row.description ? String(row.description) : null,
    tags: Array.isArray(row.tags) ? row.tags.join(',') : null,
    priceCents: toCents(row.price),
    stock: Number.parseInt(row.stock, 10) || 0
  }
}

module.exports = { parseCatalog, toProduct, MAX_ROWS }
