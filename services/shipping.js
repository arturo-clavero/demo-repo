'use strict'

// Flat shipping table by zone, in cents. Orders above the free-shipping
// threshold of their zone ship for free.
const ZONES = {
  domestic: { countries: ['IE'], baseCents: 450, perItemCents: 50, freeFromCents: 5000 },
  eu: { countries: ['ES', 'FR', 'DE', 'IT', 'NL', 'BE', 'PT', 'AT'], baseCents: 950, perItemCents: 100, freeFromCents: 10000 },
  world: { countries: [], baseCents: 1900, perItemCents: 200, freeFromCents: null }
}

function zoneFor (country) {
  const code = String(country || '').toUpperCase()
  const match = Object.entries(ZONES).find(([, zone]) => zone.countries.includes(code))
  return match ? match[0] : 'world'
}

function quote (country, subtotalCents, itemCount) {
  const zoneName = zoneFor(country)
  const zone = ZONES[zoneName]
  const free = zone.freeFromCents !== null && subtotalCents >= zone.freeFromCents
  const cents = free ? 0 : zone.baseCents + zone.perItemCents * Math.max(itemCount - 1, 0)
  return { zone: zoneName, cents, free }
}

module.exports = { quote, zoneFor, ZONES }
