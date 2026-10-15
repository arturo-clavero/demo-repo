'use strict'

// Raised by the service layer when a dependency fails. The original error is
// kept as `cause` so the log line shows the real failure, while the client
// only ever sees the generic message.
class ServiceError extends Error {
  constructor (message, options = {}) {
    super(message, { cause: options.cause })
    this.name = 'ServiceError'
    this.status = 502
    this.expose = false
  }
}

module.exports = { ServiceError }
