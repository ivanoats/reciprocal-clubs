import { describe, expect, it } from 'vitest'

import { clubMatchesFilters, type Club } from './club'

const sampleClub: Club = {
  name: 'Anacortes Yacht Club',
  region: 'Northern Inland Waters',
  distanceNm: 58,
  website: 'http://www.anacortesyachtclub.org',
  address: '611 T Ave, Anacortes, WA 98221',
  phone: '+1 360-293-5277',
  longitude: -122.605,
  latitude: 48.5125,
}

describe('clubMatchesFilters', () => {
  it('matches exact region in a case-insensitive way', () => {
    expect(clubMatchesFilters(sampleClub, { region: 'northern inland waters' })).toBe(true)
  })

  it('rejects clubs from different regions', () => {
    expect(clubMatchesFilters(sampleClub, { region: 'vancouver area' })).toBe(false)
  })

  it('matches free text query against name and address', () => {
    expect(clubMatchesFilters(sampleClub, { query: 'anacortes' })).toBe(true)
    expect(clubMatchesFilters(sampleClub, { query: '611 t ave' })).toBe(true)
  })
})
