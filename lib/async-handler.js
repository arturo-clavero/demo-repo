'use strict'

// Express 4 does not forward rejected promises to the error middleware.
// Every async route goes through this wrapper so a rejection always becomes a
// response instead of a hanging request.
module.exports = function asyncHandler (fn) {
  return function wrapped (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
