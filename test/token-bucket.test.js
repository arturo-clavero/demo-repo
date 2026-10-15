'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { TokenBucket } = require('../lib/token-bucket')

function clock (start = 0) {
  let now = start
  return { now: () => now, advance: (ms) => { now += ms } }
}

test('allows a burst up to capacity, then refuses', () => {
  const time = clock()
  const bucket = new TokenBucket({ capacity: 3, refillPerSecond: 1, now: time.now })
  assert.deepEqual([1, 2, 3, 4].map(() => bucket.take('ip')), [true, true, true, false])
})

test('refills over time', () => {
  const time = clock()
  const bucket = new TokenBucket({ capacity: 1, refillPerSecond: 0.5, now: time.now })
  assert.ok(bucket.take('ip'))
  assert.ok(!bucket.take('ip'))
  time.advance(2000)
  assert.ok(bucket.take('ip'))
})

test('keys are independent', () => {
  const bucket = new TokenBucket({ capacity: 1, refillPerSecond: 1, now: clock().now })
  assert.ok(bucket.take('a'))
  assert.ok(bucket.take('b'))
})

test('retryAfterSeconds says how long until the next token', () => {
  const time = clock()
  const bucket = new TokenBucket({ capacity: 1, refillPerSecond: 0.25, now: time.now })
  bucket.take('ip')
  assert.equal(bucket.retryAfterSeconds('ip'), 4)
  assert.equal(bucket.retryAfterSeconds('unknown'), 0)
})
