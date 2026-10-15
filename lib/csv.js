'use strict'

// Spreadsheet apps execute cells that start with these characters, so an
// exported product name like "=HYPERLINK(...)" is prefixed with a quote.
const FORMULA_START = /^[=+\-@\t\r]/

function cell (value) {
  const text = value === null || value === undefined ? '' : String(value)
  const safe = FORMULA_START.test(text) ? `'${text}` : text
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

function toCsv (columns, rows) {
  const header = columns.map((c) => cell(c.label)).join(',')
  const lines = rows.map((row) => columns.map((c) => cell(row[c.key])).join(','))
  return [header, ...lines].join('\n') + '\n'
}

module.exports = { toCsv, cell }
