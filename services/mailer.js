'use strict'

const config = require('../config/server')
const logger = require('../lib/logger')
const { ServiceError } = require('../lib/service-error')

// Mail goes through the provider's HTTP API. In development (no MAIL_API_URL)
// the message is logged instead of sent.
async function send (to, subject, text) {
  const endpoint = process.env.MAIL_API_URL
  if (!endpoint) {
    logger.info('mail (not sent, no MAIL_API_URL)', { to, subject })
    return
  }
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.MAIL_API_KEY}` },
      body: JSON.stringify({ to, subject, text }),
      signal: AbortSignal.timeout(8000)
    })
  } catch (err) {
    throw new ServiceError('could not send mail', { cause: err })
  }
}

async function sendResetLink (user, token) {
  const link = new URL('/resetpw', config.publicOrigin)
  link.searchParams.set('token', token)
  await send(user.email, 'Reset your Shopfloor password',
    `Hi ${user.name},\n\nUse this link within 30 minutes to choose a new password:\n${link}\n\nIf you did not ask for it, ignore this email.`)
}

module.exports = { send, sendResetLink }
