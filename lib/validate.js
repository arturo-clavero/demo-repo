'use strict'

const { badRequest } = require('./http-error')

const LOGIN = /^[a-z0-9_.-]{3,32}$/i
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 10

function requireFields (body, fields) {
  const missing = fields.filter((field) => !body[field])
  if (missing.length > 0) {
    throw badRequest(`missing: ${missing.join(', ')}`, 'missing_fields')
  }
}

function checkLogin (login) {
  if (!LOGIN.test(login)) throw badRequest('login must be 3-32 letters, digits, dot, dash or underscore', 'bad_login')
}

function checkEmail (email) {
  if (!EMAIL.test(email)) throw badRequest('email is not valid', 'bad_email')
}

function checkNewPassword (password, confirmation) {
  if (password.length < MIN_PASSWORD) throw badRequest(`password needs ${MIN_PASSWORD} characters`, 'weak_password')
  if (password !== confirmation) throw badRequest('passwords do not match', 'password_mismatch')
}

function positiveInt (value, name) {
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1) throw badRequest(`${name} must be a positive integer`, 'bad_number')
  return n
}

module.exports = { requireFields, checkLogin, checkEmail, checkNewPassword, positiveInt, MIN_PASSWORD }
