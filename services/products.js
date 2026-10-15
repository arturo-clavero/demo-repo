'use strict'

const db = require('../models')
const { notFound } = require('../lib/http-error')

const LIKE_SPECIAL = /[\\%_]/g

// The search term goes to the driver as a bound value; only LIKE's own
// wildcards are escaped so "50%" finds "50%" and not everything.
function containsPattern (term) {
  return `%${String(term).replace(LIKE_SPECIAL, '\\$&')}%`
}

async function list ({ term, limit, offset }) {
  const where = { active: true }
  if (term) {
    where.name = { [db.Op.like]: containsPattern(term) }
  }
  return db.Product.findAndCountAll({ where, order: [['name', 'ASC']], limit, offset })
}

async function get (id) {
  const product = await db.Product.findOne({ where: { id, active: true } })
  if (!product) throw notFound('No such product')
  return product
}

async function save (id, fields) {
  const values = {
    code: fields.code,
    name: fields.name,
    description: fields.description,
    tags: fields.tags,
    priceCents: fields.priceCents,
    stock: fields.stock
  }
  if (!id) return db.Product.create(values)
  const product = await get(id)
  return product.update(values)
}

async function retire (id) {
  const [changed] = await db.Product.update({ active: false }, { where: { id } })
  if (changed === 0) throw notFound('No such product')
}

module.exports = { list, get, save, retire, containsPattern }
