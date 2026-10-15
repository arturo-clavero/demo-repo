'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { HttpError, badRequest, notFound, conflict } = require('../lib/http-error')
const { ServiceError } = require('../lib/service-error')

test('client errors are exposed, server errors are not', () => {
  assert.equal(badRequest('nope').expose, true)
  assert.equal(new HttpError(500, 'db down').expose, false)
})

test('helpers set status and code', () => {
  assert.equal(notFound().status, 404)
  const err = conflict('taken', 'account_exists')
  assert.equal(err.status, 409)
  assert.equal(err.code, 'account_exists')
})

test('ServiceError keeps the cause and hides the message', () => {
  const cause = new Error('ECONNREFUSED')
  const err = new ServiceError('worker unreachable', { cause })
  assert.equal(err.cause, cause)
  assert.equal(err.expose, false)
  assert.equal(err.status, 502)
})
