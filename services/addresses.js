'use strict'

const db = require('../models')
const { normaliseAddress } = require('../lib/address')
const { notFound, badRequest } = require('../lib/http-error')

const MAX_ADDRESSES = 10

async function list (userId) {
  return db.Address.findAll({ where: { userId }, order: [['isDefault', 'DESC'], ['id', 'ASC']] })
}

async function get (userId, id) {
  const address = await db.Address.findOne({ where: { id, userId } })
  if (!address) throw notFound('No such address')
  return address
}

async function add (userId, input) {
  const count = await db.Address.count({ where: { userId } })
  if (count >= MAX_ADDRESSES) throw badRequest(`at most ${MAX_ADDRESSES} addresses`, 'too_many_addresses')
  return db.Address.create({ ...normaliseAddress(input), userId, isDefault: count === 0 })
}

async function update (userId, id, input) {
  const address = await get(userId, id)
  return address.update(normaliseAddress(input))
}

// Exactly one default per user: both writes happen in one transaction.
async function makeDefault (userId, id) {
  const address = await get(userId, id)
  await db.sequelize.transaction(async (transaction) => {
    await db.Address.update({ isDefault: false }, { where: { userId }, transaction })
    await address.update({ isDefault: true }, { transaction })
  })
  return address
}

async function remove (userId, id) {
  const address = await get(userId, id)
  await address.destroy()
}

module.exports = { list, get, add, update, makeDefault, remove, MAX_ADDRESSES }
