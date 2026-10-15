'use strict'

const express = require('express')
const passport = require('passport')
const session = require('express-session')
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const flash = require('express-flash')
const config = require('./config/server')
const sessionOptions = require('./config/session')
const configurePassport = require('./config/passport')
const requestId = require('./middleware/request-id')
const securityHeaders = require('./middleware/security-headers')
const { requireLogin, requireApiLogin, requireAdmin } = require('./middleware/auth')
const { notFoundHandler, errorHandler } = require('./middleware/errors')

function createApp () {
  const app = express()
  app.set('view engine', 'ejs')
  app.set('trust proxy', config.trustProxy)
  app.disable('x-powered-by')

  app.use(requestId)
  app.use(securityHeaders)
  app.use(morgan('tiny'))
  app.use(express.urlencoded({ extended: false, limit: '100kb' }))
  app.use(express.json({ limit: '100kb' }))
  app.use(fileUpload({ limits: { fileSize: 2 * 1024 * 1024 }, abortOnLimit: true }))
  app.use(session(sessionOptions()))
  configurePassport(passport)
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())

  app.use('/health', require('./routes/health'))
  app.use('/', require('./routes/auth')(passport))
  app.use('/app/products', requireLogin, require('./routes/products'))
  app.use('/app/account', requireLogin, require('./routes/account'))
  app.use('/app/admin', requireLogin, requireAdmin, require('./routes/admin'))
  app.use('/api/stats', requireApiLogin, requireAdmin, require('./routes/stats'))
  app.use('/api/cart', requireApiLogin, require('./routes/cart'))
  app.use('/api/orders', requireApiLogin, require('./routes/orders'))
  app.use('/api/addresses', requireApiLogin, require('./routes/addresses'))
  app.use('/api/exports', requireApiLogin, requireAdmin, require('./routes/exports'))

  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}

module.exports = { createApp }
