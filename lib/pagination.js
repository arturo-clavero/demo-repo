'use strict'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function toInt (value, fallback) {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

// Reads ?page= and ?limit= and clamps them, so a client can never ask the
// database for an unbounded page.
function parsePage (query = {}) {
  const limit = Math.min(Math.max(toInt(query.limit, DEFAULT_LIMIT), 1), MAX_LIMIT)
  const page = Math.max(toInt(query.page, 1), 1)
  return { page, limit, offset: (page - 1) * limit }
}

function pageMeta ({ page, limit }, total) {
  return { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) }
}

module.exports = { parsePage, pageMeta, DEFAULT_LIMIT, MAX_LIMIT }
