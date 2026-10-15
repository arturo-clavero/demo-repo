'use strict'

const { execFile } = require('child_process')
const { promisify } = require('util')
const { badRequest } = require('../lib/http-error')

const run = promisify(execFile)
const HOSTNAME = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i

// Admin diagnostics: can this host reach the payment provider? The host is
// validated and passed as an argument to ping, never through a shell.
async function ping (host) {
  if (!HOSTNAME.test(host)) {
    throw badRequest('Enter a host name such as api.example.com', 'bad_host')
  }
  try {
    const { stdout } = await run('ping', ['-c', '2', '-W', '2', host], { timeout: 6000 })
    return { reachable: true, output: stdout }
  } catch (err) {
    return { reachable: false, output: err.stdout || err.message }
  }
}

module.exports = { ping, HOSTNAME }
