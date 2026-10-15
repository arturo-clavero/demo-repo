'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { requireFields, checkLogin, checkEmail, checkNewPassword, positiveInt } = require('../lib/validate')
const { HttpError } = require('../lib/http-error')

test('requireFields lists every missing field', () => {
  assert.throws(() => requireFields({ a: 1 }, ['a', 'b', 'c']), (err) => {
    assert.ok(err instanceof HttpError)
    assert.equal(err.status, 400)
    assert.equal(err.message, 'missing: b, c')
    return true
  })
})

test('checkLogin and checkEmail accept normal input', () => {
  assert.doesNotThrow(() => checkLogin('ana.lopez'))
  assert.doesNotThrow(() => checkEmail('ana@example.com'))
})

test('checkLogin and checkEmail reject bad input', () => {
  assert.throws(() => checkLogin('a'), HttpError)
  assert.throws(() => checkLogin('robert"); drop'), HttpError)
  assert.throws(() => checkEmail('not-an-email'), HttpError)
})

test('checkNewPassword wants length and a matching confirmation', () => {
  assert.throws(() => checkNewPassword('short', 'short'), /10 characters/)
  assert.throws(() => checkNewPassword('long-enough-1', 'long-enough-2'), /do not match/)
  assert.doesNotThrow(() => checkNewPassword('long-enough-1', 'long-enough-1'))
})

test('positiveInt parses ids', () => {
  assert.equal(positiveInt('42', 'id'), 42)
  assert.throws(() => positiveInt('0', 'id'), HttpError)
  assert.throws(() => positiveInt('4.2', 'id'), HttpError)
})
