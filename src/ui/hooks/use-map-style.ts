import { useMemo } from 'react'
import type { StyleSpecification } from 'maplibre-gl'

import {
  type MapMode,
  MAPLIBRE_GLYPHS_URL,
  PMTILES_ARCHIVE_URLS,
  CHART_BOUNDS,
  CHART_MIN_ZOOM,
  CHART_MAX_ZOOM,
  NOAA_CHART_ATTRIBUTION,
} from '@/ui/map-constants'

const NAUTICAL_RASTER_PAINT = {
  'raster-opacity': 1,
  'raster-resampling': 'nearest' as const,
  'raster-contrast': 0.08,
  'raster-saturation': 0.12,
}

export const createBaseStyle = (mapMode: MapMode): StyleSpecification => {
  const isNautical = mapMode === 'nautical'

  const nauticalSources = Object.fromEntries(
    PMTILES_ARCHIVE_URLS.map((url, i) => [
      `noaa-${i}`,
      {
        type: 'raster' as const,
        url,
        tileSize: 256,
        bounds: CHART_BOUNDS,
        minzoom: CHART_MIN_ZOOM,
        maxzoom: CHART_MAX_ZOOM,
        attribution: i === 0 ? NOAA_CHART_ATTRIBUTION : '',
      },
    ])
  )

  const nauticalLayers = PMTILES_ARCHIVE_URLS.map((_, i) => ({
    id: `nautical-base-${i}`,
    type: 'raster' as const,
    source: `noaa-${i}`,
    minzoom: 8,
    paint: NAUTICAL_RASTER_PAINT,
  }))

  const layers: NonNullable<StyleSpecification['layers']> = isNautical
    ? [
        { id: 'map-background', type: 'background', paint: { 'background-color': '#eef2f6' } },
        {
          id: 'osm-base',
          type: 'raster' as const,
          source: 'osm',
          paint: { 'raster-opacity': 0.85, 'raster-saturation': -0.25 },
        },
        ...nauticalLayers,
      ]
    : [
        { id: 'map-background', type: 'background', paint: { 'background-color': '#d7e3ef' } },
        { id: 'base-map', type: 'raster', source: 'osm' },
      ]

  return {
    version: 8,
    glyphs: MAPLIBRE_GLYPHS_URL,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors',
      },
      ...nauticalSources,
    },
    layers,
  }
}

export const useMapStyle = (mapMode: MapMode): StyleSpecification =>
  useMemo(() => createBaseStyle(mapMode), [mapMode])
