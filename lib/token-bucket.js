'use strict'

// A token bucket per key: `capacity` requests at once, refilled at
// `refillPerSecond`. In-memory, so it limits per process; the load balancer
// pins a client to a process for the login form, which is where it matters.
class TokenBucket {
  constructor ({ capacity, refillPerSecond, now = Date.now }) {
    this.capacity = capacity
    this.refillPerMs = refillPerSecond / 1000
    this.now = now
    this.buckets = new Map()
  }

  take (key) {
    const at = this.now()
    const bucket = this.buckets.get(key) || { tokens: this.capacity, at }
    const refilled = Math.min(this.capacity, bucket.tokens + (at - bucket.at) * this.refillPerMs)
    const allowed = refilled >= 1
    this.buckets.set(key, { tokens: allowed ? refilled - 1 : refilled, at })
    return allowed
  }

  retryAfterSeconds (key) {
    const bucket = this.buckets.get(key)
    const missing = bucket ? 1 - bucket.tokens : 0
    return Math.max(Math.ceil(missing / this.refillPerMs / 1000), 0)
  }
}

module.exports = { TokenBucket }
