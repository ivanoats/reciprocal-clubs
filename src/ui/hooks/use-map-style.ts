import { useMemo } from 'react'
import type { StyleSpecification } from 'maplibre-gl'

import {
  type MapMode,
  MAPLIBRE_GLYPHS_URL,
  PMTILES_ARCHIVE_URL,
  CHART_BOUNDS,
  CHART_MIN_ZOOM,
  CHART_MAX_ZOOM,
  NOAA_CHART_ATTRIBUTION,
} from '@/ui/map-constants'

const getNauticalSourceConfig = () => ({
  type: 'raster' as const,
  url: PMTILES_ARCHIVE_URL,
  tileSize: 256,
  bounds: CHART_BOUNDS,
  minzoom: CHART_MIN_ZOOM,
  maxzoom: CHART_MAX_ZOOM,
  attribution: NOAA_CHART_ATTRIBUTION,
})

export const createBaseStyle = (mapMode: MapMode): StyleSpecification => {
  const isNautical = mapMode === 'nautical'

  const layers: NonNullable<StyleSpecification['layers']> = isNautical
    ? [
        { id: 'map-background', type: 'background', paint: { 'background-color': '#eef2f6' } },
        {
          id: 'osm-base',
          type: 'raster' as const,
          source: 'osm',
          paint: { 'raster-opacity': 0.85, 'raster-saturation': -0.25 },
        },
        {
          id: 'nautical-base',
          type: 'raster' as const,
          source: 'noaa',
          minzoom: 8,
          paint: {
            'raster-opacity': 1,
            'raster-resampling': 'nearest',
            'raster-contrast': 0.08,
            'raster-saturation': 0.12,
          },
        },
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
      noaa: getNauticalSourceConfig(),
    },
    layers,
  }
}

export const useMapStyle = (mapMode: MapMode): StyleSpecification =>
  useMemo(() => createBaseStyle(mapMode), [mapMode])
