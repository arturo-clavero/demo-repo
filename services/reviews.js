'use strict'

const db = require('../models')
const { badRequest } = require('../lib/http-error')

async function forProduct (productId, { limit, offset }) {
  return db.Review.findAndCountAll({
    where: { productId },
    include: [{ model: db.User, attributes: ['name'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset
  })
}

// One review per customer and product; a second post edits the first.
async function upsert (userId, productId, { rating, body }) {
  const stars = Number(rating)
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw badRequest('rating must be 1 to 5', 'bad_rating')
  }
  const [review] = await db.Review.upsert({ userId, productId, rating: stars, body })
  return review
}

async function averageRating (productId) {
  const result = await db.Review.findOne({
    where: { productId },
    attributes: [[db.sequelize.fn('AVG', db.sequelize.col('rating')), 'average']],
    raw: true
  })
  return result.average === null ? null : Number(result.average)
}

module.exports = { forProduct, upsert, averageRating }
