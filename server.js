'use strict'

const config = require('./config/server')
const db = require('./models')
const logger = require('./lib/logger')
const { createApp } = require('./app')

// The process only starts listening once the database is reachable, and exits
// non-zero otherwise so the orchestrator restarts it.
db.sequelize.authenticate()
  .then(() => db.sequelize.sync())
  .then(() => {
    const server = createApp().listen(config.port, config.listen, () => {
      logger.info('listening', { port: config.port })
    })
    process.on('SIGTERM', () => server.close(() => process.exit(0)))
  })
  .catch((err) => {
    logger.error('could not start', { error: err.message })
    process.exit(1)
  })
