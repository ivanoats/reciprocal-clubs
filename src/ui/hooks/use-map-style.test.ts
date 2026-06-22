import { describe, expect, it } from 'vitest'

import { createBaseStyle } from './use-map-style'
import { NOAA_WMTS_TILE_URL } from '@/ui/map-constants'

describe('createBaseStyle', () => {
  it('produces a valid base style with glyphs and an OSM source in every mode', () => {
    for (const mode of ['nautical', 'standard', 'wmts'] as const) {
      const style = createBaseStyle(mode)
      expect(style.version).toBe(8)
      expect(style.glyphs).toBeTruthy()
      expect(style.sources.osm).toMatchObject({ type: 'raster' })
    }
  })

  it('nautical mode adds NOAA PMTiles sources and a layered OSM base underneath', () => {
    const style = createBaseStyle('nautical')
    const sourceIds = Object.keys(style.sources)
    expect(sourceIds).toContain('noaa-0')
    expect(sourceIds.some((id) => id.startsWith('wmts-'))).toBe(false)

    const layerIds = (style.layers ?? []).map((layer) => layer.id)
    expect(layerIds).toContain('osm-base')
    expect(layerIds).toContain('nautical-base-0')
  })

  it('standard mode renders only the plain OSM base layer, no nautical or wmts layers', () => {
    const style = createBaseStyle('standard')
    const sourceIds = Object.keys(style.sources)
    expect(sourceIds).toContain('osm')
    expect(sourceIds.some((id) => id.startsWith('wmts-'))).toBe(false)

    const layerIds = (style.layers ?? []).map((layer) => layer.id)
    expect(layerIds).toContain('base-map')
    expect(layerIds).not.toContain('osm-base')
    expect(layerIds).not.toContain('noaa-wmts-base')
  })

  it('wmts mode sources OpenSeaMap tiles under a non-"noaa-" prefixed source id', () => {
    const style = createBaseStyle('wmts')
    const sourceIds = Object.keys(style.sources)

    expect(sourceIds).toContain('wmts-noaa-charts')

    // Regression guard (PR #9): the source carrying the OpenSeaMap WMTS tiles
    // must NOT match the `noaa-` prefix used by useNauticalSourceHealth, or it
    // pollutes the PMTiles health tracking.
    const wmtsSourceId = sourceIds.find((id) => {
      const source = style.sources[id] as { tiles?: string[] }
      return source.tiles?.[0] === NOAA_WMTS_TILE_URL
    })
    expect(wmtsSourceId).toBe('wmts-noaa-charts')
    expect(wmtsSourceId?.startsWith('noaa-')).toBe(false)

    const wmtsLayer = (style.layers ?? []).find((layer) => layer.id === 'noaa-wmts-base')
    expect(wmtsLayer).toMatchObject({ source: 'wmts-noaa-charts' })
  })
})
