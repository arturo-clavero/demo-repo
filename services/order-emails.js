'use strict'

const mailer = require('./mailer')
const { formatCents } = require('../lib/money')

function orderSummary (order) {
  const lines = order.items.map((item) => `  ${item.quantity} x ${item.productName}  ${formatCents(item.unitCents * item.quantity)}`)
  const discount = order.discountCents > 0 ? [`  Discount (${order.couponCode})  -${formatCents(order.discountCents)}`] : []
  return [...lines, ...discount, `  Total  ${formatCents(order.totalCents)}`].join('\n')
}

async function sendConfirmation (user, order) {
  await mailer.send(user.email, `Order #${order.id} confirmed`,
    `Hi ${user.name},\n\nThanks for your order. Here is what you bought:\n\n${orderSummary(order)}\n\nWe will email you again when it ships.`)
}

async function sendShipped (user, order) {
  await mailer.send(user.email, `Order #${order.id} is on its way`,
    `Hi ${user.name},\n\nYour order #${order.id} has shipped.\n\n${orderSummary(order)}`)
}

module.exports = { sendConfirmation, sendShipped, orderSummary }
