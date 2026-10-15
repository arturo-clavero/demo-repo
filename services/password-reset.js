'use strict'

const db = require('../models')
const { newToken, hashToken } = require('../lib/tokens')
const { badRequest } = require('../lib/http-error')
const users = require('./users')

const TTL_MS = 30 * 60 * 1000

// Creates a single-use reset token. The caller emails `token`; only its hash
// is stored. An unknown email returns null and the caller answers exactly as
// for a known one, so the form cannot be used to enumerate accounts.
async function startReset (email, now = new Date()) {
  const user = await db.User.findOne({ where: { email } })
  if (!user) return null
  const token = newToken()
  await db.PasswordReset.create({
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(now.getTime() + TTL_MS)
  })
  return { user, token }
}

async function findUsableReset (token, now = new Date()) {
  const reset = await db.PasswordReset.findOne({
    where: { tokenHash: hashToken(token), usedAt: null, expiresAt: { [db.Op.gt]: now } }
  })
  if (!reset) throw badRequest('This reset link is invalid or has expired', 'bad_reset_token')
  return reset
}

async function finishReset (token, password, now = new Date()) {
  const reset = await findUsableReset(token, now)
  await db.sequelize.transaction(async (transaction) => {
    await reset.update({ usedAt: now }, { transaction })
    await db.PasswordReset.destroy({ where: { userId: reset.userId, usedAt: null }, transaction })
  })
  await users.changePassword(reset.userId, password)
}

module.exports = { startReset, findUsableReset, finishReset, TTL_MS }
