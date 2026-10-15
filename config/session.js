'use strict'

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000

// The secret is read from the environment and the process refuses to start
// without it, so a missing variable can never fall back to a known value.
function sessionSecret (env) {
  const secret = env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET is not set')
  }
  return secret
}

module.exports = function sessionOptions (env = process.env) {
  return {
    name: 'shopfloor.sid',
    secret: sessionSecret(env),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      maxAge: EIGHT_HOURS_MS
    }
  }
}
