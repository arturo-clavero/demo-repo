'use strict'

const LocalStrategy = require('passport-local').Strategy
const db = require('../models')
const users = require('../services/users')

module.exports = function configurePassport (passport) {
  passport.serializeUser((user, done) => done(null, user.id))

  passport.deserializeUser((id, done) => {
    db.User.findOne({ where: { id } })
      .then((user) => done(null, user || false))
      .catch((err) => { done(err) })
  })

  passport.use('login', new LocalStrategy((login, password, done) => {
    users.verifyCredentials(login, password)
      .then((user) => done(null, user || false, user ? undefined : { message: 'Invalid credentials' }))
      .catch((err) => { done(err) })
  }))
}
