'use strict'

const express = require('express')
const users = require('../services/users')
const asyncHandler = require('../lib/async-handler')
const { checkEmail, checkNewPassword } = require('../lib/validate')

const router = express.Router()

router.get('/', (req, res) => {
  res.render('app/useredit', { userId: req.user.id, userEmail: req.user.email, userName: req.user.name })
})

// The user edited is always the signed-in one: the form's hidden id field is
// ignored, so nobody can edit another account by changing it.
router.post('/', asyncHandler(async (req, res) => {
  checkEmail(req.body.email)
  await users.updateProfile(req.user.id, { name: req.body.name, email: req.body.email })
  if (req.body.password) {
    checkNewPassword(req.body.password, req.body.cpassword)
    await users.changePassword(req.user.id, req.body.password)
  }
  req.flash('success', 'Profile updated')
  res.redirect('/app/account')
}))

module.exports = router
