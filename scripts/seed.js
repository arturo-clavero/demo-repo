'use strict'

// Creates a local admin, a customer and a small catalogue. Run once after
// `docker compose up`: docker compose exec app node scripts/seed.js
const db = require('../models')
const users = require('../services/users')

const PRODUCTS = [
  { code: 'MUG-001', name: 'Enamel mug', priceCents: 1200, stock: 40, tags: 'kitchen' },
  { code: 'TEA-010', name: 'Green tea, 100 g', priceCents: 650, stock: 120, tags: 'tea' },
  { code: 'TEA-011', name: 'Breakfast tea, 250 g', priceCents: 890, stock: 80, tags: 'tea' },
  { code: 'POT-002', name: 'Cast iron teapot', priceCents: 4500, stock: 6, tags: 'kitchen' },
  { code: 'BAG-003', name: 'Canvas tote', priceCents: 1500, stock: 25, tags: 'bags' }
]

async function seedUser (login, role) {
  const existing = await db.User.findOne({ where: { login } })
  if (existing) return existing
  const password = process.env.SEED_PASSWORD
  if (!password) throw new Error('set SEED_PASSWORD to seed users')
  const user = await users.register({ login, email: `${login}@shopfloor.test`, name: login, password })
  return user.update({ role })
}

async function main () {
  await db.sequelize.sync()
  await seedUser('admin', 'admin')
  await seedUser('customer', 'customer')
  await db.Product.bulkCreate(PRODUCTS, { ignoreDuplicates: true })
  await db.Coupon.findOrCreate({ where: { code: 'WELCOME10' }, defaults: { percentOff: 10, minSubtotalCents: 2000 } })
}

main()
  .then(() => db.sequelize.close())
  .catch((err) => {
    console.error(new Error('seeding failed', { cause: err }))
    process.exitCode = 1
  })
