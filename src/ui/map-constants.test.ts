import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  CHART_BOUNDS,
  NOAA_WMTS_MAX_ZOOM,
  NOAA_WMTS_TILE_URL,
  PMTILES_ARCHIVE_URL,
  PMTILES_ARCHIVE_URLS,
} from './map-constants'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('map-constants (defaults)', () => {
  it('exposes the OpenSeaMap seamark tile URL and max zoom', () => {
    expect(NOAA_WMTS_TILE_URL).toBe('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png')
    expect(NOAA_WMTS_MAX_ZOOM).toBe(18)
  })

  it('normalises the default PMTiles archive URL with a pmtiles:// prefix', () => {
    expect(PMTILES_ARCHIVE_URLS).toHaveLength(1)
    expect(PMTILES_ARCHIVE_URLS[0].startsWith('pmtiles://')).toBe(true)
    expect(PMTILES_ARCHIVE_URL).toBe(PMTILES_ARCHIVE_URLS[0])
  })

  it('defines PNW chart bounds as [west, south, east, north]', () => {
    const [west, south, east, north] = CHART_BOUNDS
    expect(west).toBeLessThan(east)
    expect(south).toBeLessThan(north)
  })
})

describe('map-constants (env overrides)', () => {
  it('splits a comma list, trims blanks, and prefixes only unprefixed URLs', async () => {
    vi.stubEnv(
      'NEXT_PUBLIC_NAUTICAL_CHART_PMTILES_URL',
      'pmtiles://already.pmtiles, https://cdn.example/charts.pmtiles ,',
    )
    vi.resetModules()
    const constants = await import('./map-constants')

    expect(constants.PMTILES_ARCHIVE_URLS).toEqual([
      'pmtiles://already.pmtiles',
      'pmtiles://https://cdn.example/charts.pmtiles',
    ])
  })

  it('honours a custom glyphs URL when provided', async () => {
    vi.stubEnv('NEXT_PUBLIC_MAPLIBRE_GLYPHS_URL', 'https://glyphs.example/{fontstack}/{range}.pbf')
    vi.resetModules()
    const constants = await import('./map-constants')

    expect(constants.MAPLIBRE_GLYPHS_URL).toBe('https://glyphs.example/{fontstack}/{range}.pbf')
  })
})
