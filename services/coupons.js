'use strict'

const db = require('../models')
const { percentOf } = require('../lib/money')
const { badRequest } = require('../lib/http-error')

function usable (coupon, subtotalCents, now) {
  const expired = coupon.expiresAt !== null && coupon.expiresAt <= now
  const usedUp = coupon.maxUses !== null && coupon.uses >= coupon.maxUses
  return !expired && !usedUp && subtotalCents >= coupon.minSubtotalCents
}

// Returns the discount in cents for a coupon code, or throws when the code
// cannot be applied to this subtotal.
async function discountFor (code, subtotalCents, now = new Date()) {
  const coupon = await db.Coupon.findOne({ where: { code: String(code).toUpperCase() } })
  if (!coupon || !usable(coupon, subtotalCents, now)) {
    throw badRequest('This coupon cannot be used for this order', 'bad_coupon')
  }
  return { coupon, discountCents: percentOf(subtotalCents, coupon.percentOff) }
}

async function redeem (coupon, transaction) {
  await coupon.increment('uses', { by: 1, transaction })
}

module.exports = { discountFor, redeem, usable }
