'use strict'

const { forbidden } = require('../lib/http-error')

// Every route under /app and /api goes through requireLogin. The original URL
// is remembered so the login form can send the user back after signing in.
function requireLogin (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  req.session.returnTo = req.originalUrl
  res.redirect('/login')
}

// JSON clients get a 401 instead of a redirect to an HTML form.
function requireApiLogin (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).json({ error: 'Sign in first' })
}

// Role check for the admin screens. Mounted after requireLogin.
function requireAdmin (req, res, next) {
  const role = req.user ? req.user.role : null
  return role === 'admin' ? next() : next(forbidden())
}

module.exports = { requireLogin, requireApiLogin, requireAdmin }
