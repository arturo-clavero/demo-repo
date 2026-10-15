'use strict'

const db = require('../models')
const { parseCatalog } = require('../lib/catalog-rows')

const UPDATABLE = ['name', 'description', 'tags', 'priceCents', 'stock']

// Bulk product import from an admin upload. Existing codes are updated in
// place, new codes are inserted, all in one statement.
async function importProducts (buffer) {
  const products = parseCatalog(buffer)
  await db.Product.bulkCreate(products, { updateOnDuplicate: UPDATABLE })
  return products.length
}

module.exports = { importProducts }
