'use strict'

module.exports = {
  port: Number(process.env.PORT || 9090),
  listen: process.env.LISTEN || '0.0.0.0',
  trustProxy: process.env.TRUST_PROXY === '1',
  workerUrl: process.env.WORKER_URL || 'http://worker:8000',
  publicOrigin: process.env.PUBLIC_ORIGIN || 'http://localhost:9090'
}
