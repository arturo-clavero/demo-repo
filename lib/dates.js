'use strict'

const DAY_MS = 24 * 60 * 60 * 1000
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

// Half-open UTC day ranges [from, to) for reports, so "2026-03-01 to
// 2026-03-31" includes the whole of the 31st.
function parseDay (text) {
  if (!ISO_DAY.test(String(text))) {
    throw new RangeError(`not a day: ${text}`)
  }
  const day = new Date(`${text}T00:00:00Z`)
  if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== text) {
    throw new RangeError(`not a day: ${text}`)
  }
  return day
}

function dayRange (fromText, toText) {
  const from = parseDay(fromText)
  const to = new Date(parseDay(toText).getTime() + DAY_MS)
  if (to <= from) throw new RangeError('the range ends before it starts')
  return { from, to }
}

function lastDays (count, now = new Date()) {
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + DAY_MS
  return { from: new Date(end - count * DAY_MS), to: new Date(end) }
}

module.exports = { parseDay, dayRange, lastDays, DAY_MS }
