'use strict'

const express = require('express')
const users = require('../services/users')
const passwordReset = require('../services/password-reset')
const mailer = require('../services/mailer')
const rateLimit = require('../middleware/rate-limit')
const asyncHandler = require('../lib/async-handler')
const { requireFields, checkLogin, checkEmail, checkNewPassword } = require('../lib/validate')

module.exports = function authRoutes (passport) {
  const router = express.Router()
  const limited = rateLimit({ capacity: 5, refillPerSecond: 0.1 })

  router.get('/login', (req, res) => res.render('login'))

  router.post('/login', limited, passport.authenticate('login', { failureRedirect: '/login', failureFlash: true }),
    (req, res) => {
      if (req.query.next) {
        return res.redirect(req.query.next)
      }
      res.redirect('/app/products')
    })

  router.post('/logout', (req, res, next) => {
    req.logout((err) => (err ? next(err) : res.redirect('/login')))
  })

  router.get('/register', (req, res) => res.render('register'))

  router.post('/register', limited, asyncHandler(async (req, res) => {
    requireFields(req.body, ['login', 'email', 'name', 'password', 'cpassword'])
    checkLogin(req.body.login)
    checkEmail(req.body.email)
    checkNewPassword(req.body.password, req.body.cpassword)
    await users.register(req.body)
    req.flash('success', 'Account created, you can sign in now')
    res.redirect('/login')
  }))

  router.get('/forgotpw', (req, res) => res.render('forgotpw'))

  router.post('/forgotpw', limited, asyncHandler(async (req, res) => {
    const started = await passwordReset.startReset(String(req.body.email || ''))
    if (started) await mailer.sendResetLink(started.user, started.token)
    req.flash('info', 'If that email has an account, a reset link is on its way')
    res.redirect('/login')
  }))

  router.get('/resetpw', asyncHandler(async (req, res) => {
    await passwordReset.findUsableReset(String(req.query.token || ''))
    res.render('resetpw', { token: req.query.token })
  }))

  router.post('/resetpw', limited, asyncHandler(async (req, res) => {
    checkNewPassword(String(req.body.password || ''), req.body.cpassword)
    await passwordReset.finishReset(String(req.body.token || ''), req.body.password)
    req.flash('success', 'Password changed, sign in with the new one')
    res.redirect('/login')
  }))

  return router
}
