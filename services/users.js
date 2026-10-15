'use strict'

const bcrypt = require('bcrypt')
const db = require('../models')
const { conflict, notFound } = require('../lib/http-error')

const BCRYPT_ROUNDS = 12

async function hashPassword (password) {
  return await bcrypt.hash(password, BCRYPT_ROUNDS)
}

async function register ({ login, email, name, password }) {
  const taken = await db.User.findOne({ where: { [db.Op.or]: [{ login }, { email }] } })
  if (taken) {
    throw conflict('An account with that login or email already exists', 'account_exists')
  }
  return db.User.create({ login, email, name, password: await hashPassword(password) })
}

// Returns the user only when the password matches. bcrypt.compare runs even
// for an unknown login (against a dummy hash) so timing does not reveal which
// logins exist.
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEeO7S0Zt7m6r2CKpbYv2bJ8n0tQwT8Zs6a'

async function verifyCredentials (login, password) {
  const user = await db.User.scope('withPassword').findOne({ where: { login } })
  const ok = await bcrypt.compare(password, user ? user.password : DUMMY_HASH)
  return ok && user ? user : null
}

async function findById (id) {
  const user = await db.User.findOne({ where: { id } })
  if (!user) throw notFound('No such user')
  return user
}

async function updateProfile (id, { name, email }) {
  const user = await findById(id)
  return user.update({ name, email })
}

async function changePassword (id, password) {
  const user = await findById(id)
  await user.update({ password: await hashPassword(password) })
}

async function listUsers ({ limit, offset }) {
  return db.User.findAndCountAll({ order: [['id', 'ASC']], limit, offset })
}

module.exports = { register, verifyCredentials, findById, updateProfile, changePassword, listUsers, hashPassword }
