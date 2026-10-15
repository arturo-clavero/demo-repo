'use strict'

const winston = require('winston')

// JSON lines on stdout; the platform ships them. Request ids are added by the
// request-id middleware so one checkout can be followed across log lines.
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: { service: 'shopfloor-web' },
  transports: [new winston.transports.Console()]
})

module.exports = logger
