'use strict'

const AMOUNT = /^\d{1,7}(\.\d{1,2})?$/

// Prices are stored as integer cents. Parsing goes through a strict pattern
// instead of parseFloat so "1e3" or "12.345" are rejected, not rounded.
function toCents (text) {
  const value = String(text).trim()
  if (!AMOUNT.test(value)) {
    throw new RangeError(`not an amount: ${value}`)
  }
  const [units, fraction = ''] = value.split('.')
  return Number(units) * 100 + Number(fraction.padEnd(2, '0'))
}

function formatCents (cents, currency = 'EUR', locale = 'en-IE') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)
}

function percentOf (cents, percent) {
  return Math.round((cents * percent) / 100)
}

function sumCents (items) {
  return items.reduce((total, item) => total + item.unitCents * item.quantity, 0)
}

module.exports = { toCents, formatCents, percentOf, sumCents }
