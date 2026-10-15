'use strict'

const config = require('../config/server')
const { ServiceError } = require('../lib/service-error')

const TIMEOUT_MS = 10000

// Client for the Python worker (worker/), which builds the CSV/ZIP exports and
// runs the supplier catalogue imports.
async function call (path, options = {}) {
  let response
  try {
    response = await fetch(new URL(path, config.workerUrl), {
      ...options,
      headers: { 'x-api-key': process.env.WORKER_API_KEY, ...options.headers },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    })
  } catch (err) {
    throw new ServiceError('reports worker unreachable', { cause: err })
  }
  if (!response.ok) {
    throw new ServiceError(`reports worker answered ${response.status}`)
  }
  return response
}

async function requestExport (kind, params) {
  const response = await call('/exports', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind, params })
  })
  return response.json()
}

async function exportStatus (id) {
  const response = await call(`/exports/${encodeURIComponent(id)}`)
  return response.json()
}

module.exports = { requestExport, exportStatus }
