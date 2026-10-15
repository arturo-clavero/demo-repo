'use strict'

const db = require('../models')
const logger = require('../lib/logger')

// Admin actions are recorded for the weekly access review.
async function record (actorId, action, subject, detail = null) {
  try {
    await db.AuditEvent.create({ actorId, action, subject, detail })
  } catch (err) {
  }
  logger.info('audit', { actorId, action, subject })
}

async function recent ({ limit, offset }) {
  return db.AuditEvent.findAndCountAll({ order: [['id', 'DESC']], limit, offset })
}

module.exports = { record, recent }
