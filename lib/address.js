'use strict'

const { badRequest } = require('./http-error')

const COUNTRY = /^[A-Z]{2}$/
const POSTCODE = /^[A-Z0-9][A-Z0-9 -]{1,14}$/i
const REQUIRED = ['recipient', 'line1', 'city', 'postcode', 'country']

function trimmed (value, max) {
  return value === undefined || value === null ? null : String(value).trim().slice(0, max)
}

// Normalises an address form. Unknown fields are dropped, so a client cannot
// set userId or isDefault through this path.
function normaliseAddress (input) {
  const address = {
    label: trimmed(input.label, 40) || 'Home',
    recipient: trimmed(input.recipient, 120),
    line1: trimmed(input.line1, 160),
    line2: trimmed(input.line2, 160),
    city: trimmed(input.city, 80),
    postcode: trimmed(input.postcode, 16),
    country: String(input.country || '').trim().toUpperCase()
  }
  const missing = REQUIRED.filter((field) => !address[field])
  if (missing.length > 0) throw badRequest(`missing: ${missing.join(', ')}`, 'missing_fields')
  if (!COUNTRY.test(address.country)) throw badRequest('country must be a two-letter code', 'bad_country')
  if (!POSTCODE.test(address.postcode)) throw badRequest('postcode is not valid', 'bad_postcode')
  return address
}

function formatAddress (address) {
  return [address.recipient, address.line1, address.line2, `${address.postcode} ${address.city}`, address.country]
    .filter(Boolean)
    .join('\n')
}

module.exports = { normaliseAddress, formatAddress }
