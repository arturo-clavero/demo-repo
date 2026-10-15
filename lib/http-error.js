'use strict'

// An error that carries the HTTP status the error middleware should answer
// with. `expose` decides whether the message may be shown to the client.
class HttpError extends Error {
  constructor (status, message, options = {}) {
    super(message, { cause: options.cause })
    this.name = 'HttpError'
    this.status = status
    this.expose = status < 500
    this.code = options.code || null
  }
}

const badRequest = (message, code) => new HttpError(400, message, { code })
const unauthorized = (message = 'Sign in first') => new HttpError(401, message)
const forbidden = (message = 'Not allowed') => new HttpError(403, message)
const notFound = (message = 'Not found') => new HttpError(404, message)
const conflict = (message, code) => new HttpError(409, message, { code })

module.exports = { HttpError, badRequest, unauthorized, forbidden, notFound, conflict }
