'use strict'

const logger = require('../lib/logger')
const { notFound } = require('../lib/http-error')

function notFoundHandler (req, res, next) {
  next(notFound(`No route for ${req.method} ${req.path}`))
}

// The one place that turns an error into a response. Server errors are logged
// with their cause chain and answered with a generic message.
// eslint-disable-next-line no-unused-vars
function errorHandler (err, req, res, next) {
  const status = err.status || 500
  if (status >= 500) {
    logger.error('request failed', { requestId: req.id, error: err.message, cause: err.cause && err.cause.message })
  }
  const message = err.expose ? err.message : 'Something went wrong'
  res.status(status)
  res.format({
    json: () => res.json({ error: message, code: err.code || undefined }),
    default: () => res.type('text').send(message)
  })
}

module.exports = { notFoundHandler, errorHandler }
