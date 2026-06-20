export type MapMode = 'nautical' | 'standard'

export const SOURCE_ID = 'clubs-source'
export const CLUSTER_LAYER_ID = 'clusters'
export const CLUSTER_COUNT_LAYER_ID = 'cluster-count'
export const CLUB_LAYER_ID = 'unclustered-club'

export const INITIAL_CENTER: [number, number] = [-122.3321, 47.6062]
export const INITIAL_PNW_BOUNDS: [[number, number], [number, number]] = [
  [-125.6, 45.3],
  [-122.2, 49.9],
]
export const CHART_BOUNDS: [number, number, number, number] = [-129.917222, 47.008889, -116.333333, 60.333333]
export const CHART_MIN_ZOOM = 0
export const CHART_MAX_ZOOM = 16
export const CHART_DETAIL_MIN_ZOOM = 12

export const SOFT_FALLBACK_TIMEOUT_MS = 8000
export const HARD_FALLBACK_TIMEOUT_MS = 18000
export const MAX_NAUTICAL_SOURCE_ERRORS_BEFORE_FALLBACK = 4

const DEFAULT_GLYPHS_URL = 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf'
export const MAPLIBRE_GLYPHS_URL =
  process.env.NEXT_PUBLIC_MAPLIBRE_GLYPHS_URL?.trim() || DEFAULT_GLYPHS_URL

const topmtilesUrl = (raw: string) =>
  raw.startsWith('pmtiles://') ? raw : `pmtiles://${raw}`

const PMTILES_ARCHIVE_URLS_RAW =
  process.env.NEXT_PUBLIC_NAUTICAL_CHART_PMTILES_URL?.trim() ||
  'http://localhost:8081/ncds_20c.pmtiles'

export const PMTILES_ARCHIVE_URLS: string[] = PMTILES_ARCHIVE_URLS_RAW
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean)
  .map(topmtilesUrl)

// Legacy single-URL alias used by any code that hasn't migrated yet
export const PMTILES_ARCHIVE_URL = PMTILES_ARCHIVE_URLS[0]

export const NOAA_CHART_ATTRIBUTION =
  process.env.NEXT_PUBLIC_NAUTICAL_CHART_ATTRIBUTION?.trim() ||
  '&copy; NOAA Office of Coast Survey'
