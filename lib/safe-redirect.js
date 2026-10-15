'use strict'

const FALLBACK = '/app/products'

// Only same-site, absolute paths are accepted as a redirect target. Anything
// else (another origin, a protocol-relative URL, a backslash trick) falls back
// to the product list.
function safeRedirectPath (target, fallback = FALLBACK) {
  if (typeof target !== 'string') {
    return fallback
  }
  const crossSite = target.startsWith('//') || target.includes('\\')
  return target.startsWith('/') && !crossSite ? target : fallback
}

module.exports = { safeRedirectPath }
