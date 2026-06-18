'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import { Protocol } from 'pmtiles'

import type { Club } from '@/domain/club'
import { css } from '../../../styled-system/css'

type MapViewProps = {
  clubs: Club[]
  selectedClubName?: string
  onSelectClub?: (clubName: string) => void
}

type MapMode = 'nautical' | 'standard'

const SOURCE_ID = 'clubs-source'
const CLUSTER_LAYER_ID = 'clusters'
const CLUSTER_COUNT_LAYER_ID = 'cluster-count'
const CLUB_LAYER_ID = 'unclustered-club'
const INITIAL_CENTER: [number, number] = [-122.3321, 47.6062]
const INITIAL_PNW_BOUNDS: [[number, number], [number, number]] = [
  [-125.6, 45.3],
  [-122.2, 49.9],
]
const CHART_BOUNDS: [number, number, number, number] = [-129.917222, 47.008889, -116.333333, 60.333333]
const CHART_MIN_ZOOM = 0
const CHART_MAX_ZOOM = 16
const DEFAULT_GLYPHS_URL = 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf'
const SOFT_FALLBACK_TIMEOUT_MS = 8000
const HARD_FALLBACK_TIMEOUT_MS = 18000
const MAX_NAUTICAL_SOURCE_ERRORS_BEFORE_FALLBACK = 4
const MAPLIBRE_GLYPHS_URL =
  process.env.NEXT_PUBLIC_MAPLIBRE_GLYPHS_URL?.trim() || DEFAULT_GLYPHS_URL
const PMTILES_ARCHIVE_URL_RAW =
  process.env.NEXT_PUBLIC_NAUTICAL_CHART_PMTILES_URL?.trim() ||
  'http://localhost:8081/ncds_20c.pmtiles'
const PMTILES_ARCHIVE_URL = PMTILES_ARCHIVE_URL_RAW.startsWith('pmtiles://')
  ? PMTILES_ARCHIVE_URL_RAW
  : `pmtiles://${PMTILES_ARCHIVE_URL_RAW}`
const NOAA_CHART_ATTRIBUTION =
  process.env.NEXT_PUBLIC_NAUTICAL_CHART_ATTRIBUTION?.trim() ||
  '&copy; NOAA Office of Coast Survey'

let hasRegisteredPmtilesProtocol = false

const getNauticalSourceConfig = () => {
  return {
    type: 'raster' as const,
    url: PMTILES_ARCHIVE_URL,
    tileSize: 256,
    bounds: CHART_BOUNDS,
    minzoom: CHART_MIN_ZOOM,
    maxzoom: CHART_MAX_ZOOM,
    attribution: NOAA_CHART_ATTRIBUTION,
  }
}

const createBaseStyle = (
  mapMode: MapMode,
): StyleSpecification => {
  const isNautical = mapMode === 'nautical'

  const layers: NonNullable<StyleSpecification['layers']> = isNautical
    ? [
        {
          id: 'map-background',
          type: 'background',
          paint: {
            'background-color': '#eef2f6',
          },
        },
        {
          id: 'osm-base',
          type: 'raster' as const,
          source: 'osm',
          paint: {
            'raster-opacity': 0.85,
            'raster-saturation': -0.25,
          },
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
        {
          id: 'map-background',
          type: 'background',
          paint: {
            'background-color': '#d7e3ef',
          },
        },
        {
          id: 'base-map',
          type: 'raster',
          source: 'osm',
        },
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
      noaa: {
        ...getNauticalSourceConfig(),
      },
    },
    layers,
  }
}

export const MapView = ({ clubs, selectedClubName, onSelectClub }: MapViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const onSelectClubRef = useRef<MapViewProps['onSelectClub']>(onSelectClub)
  const [mapMode, setMapMode] = useState<MapMode>('nautical')
  const [noaaLoaded, setNoaaLoaded] = useState(false)
  const [noaaErrorCount, setNoaaErrorCount] = useState(0)
  const [lastNauticalError, setLastNauticalError] = useState<string>('')
  const activeNauticalSourceLabel = 'PMTiles'
  const mapStyle = useMemo(
    () => createBaseStyle(mapMode),
    [mapMode],
  )

  const featureCollection = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: clubs.map((club) => ({
        type: 'Feature' as const,
        properties: {
          name: club.name,
          region: club.region,
          distanceNm: club.distanceNm,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [club.longitude, club.latitude] as [number, number],
        },
      })),
    }),
    [clubs],
  )

  useEffect(() => {
    onSelectClubRef.current = onSelectClub
  }, [onSelectClub])

  useEffect(() => {
    if (hasRegisteredPmtilesProtocol) {
      return
    }

    const protocol = new Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)
    hasRegisteredPmtilesProtocol = true
  }, [])

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    let hasLoadedNauticalSource = false
    let nauticalSourceErrorCount = 0

    const isNauticalSourceError = (event: maplibregl.ErrorEvent) => {
      const sourceId = (event as { sourceId?: string }).sourceId
      if (sourceId === 'noaa') {
        return true
      }

      const message =
        event.error instanceof Error ? event.error.message.toLowerCase() : String(event.error).toLowerCase()

      return message.includes('pmtiles') || message.includes('source "noaa"') || message.includes('noaa')
    }

    const markNauticalSourceError = (reason: string) => {
      nauticalSourceErrorCount += 1
      setNoaaErrorCount((current) => current + 1)
      setLastNauticalError(reason)
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: INITIAL_CENTER,
      zoom: 4.5,
      cancelPendingTileRequestsWhileZooming: false,
    })
    mapRef.current = map

    const fallbackTimer =
      mapMode === 'nautical'
        ? window.setTimeout(() => {
            if (!hasLoadedNauticalSource) {
              setLastNauticalError('Chart source is slow to respond; waiting before fallback.')
            }
          }, SOFT_FALLBACK_TIMEOUT_MS)
        : null

    const hardFallbackTimer =
      mapMode === 'nautical'
        ? window.setTimeout(() => {
            if (!hasLoadedNauticalSource) {
              setLastNauticalError('PMTiles chart source unavailable.')
            }
          }, HARD_FALLBACK_TIMEOUT_MS)
        : null

    map.on('sourcedata', (event) => {
      const sourceId = (event as { sourceId?: string }).sourceId
      const isSourceLoaded = (event as { isSourceLoaded?: boolean }).isSourceLoaded
      const sourceDataType = (event as { sourceDataType?: string }).sourceDataType

      if (sourceId === 'noaa' && (isSourceLoaded || sourceDataType === 'content')) {
        hasLoadedNauticalSource = true
        setNoaaLoaded(true)
        setLastNauticalError('')
      }
    })

    const resizeObserver = new ResizeObserver(() => {
      map.resize()
    })
    resizeObserver.observe(containerRef.current)

    map.on('move', () => {
      map.triggerRepaint()
    })

    map.on('load', () => {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: featureCollection,
        cluster: true,
        clusterMaxZoom: 9,
        clusterRadius: 42,
      })

      map.addLayer({
        id: CLUSTER_LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#0e7490',
          'circle-radius': ['step', ['get', 'point_count'], 18, 12, 24, 32, 30],
          'circle-opacity': 0.8,
        },
      })

      map.addLayer({
        id: CLUSTER_COUNT_LAYER_ID,
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Open Sans Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      })

      map.addLayer({
        id: CLUB_LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#0891b2',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-radius': 7,
        },
      })

      map.on('click', CLUSTER_LAYER_ID, (event) => {
        const features = map.queryRenderedFeatures(event.point, {
          layers: [CLUSTER_LAYER_ID],
        })
        const clusterFeature = features[0]
        if (!clusterFeature) {
          return
        }

        const clusterId = clusterFeature.properties?.cluster_id as number | undefined
        const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
        if (!source || clusterId === undefined) {
          return
        }

        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          const coordinates = clusterFeature.geometry?.type === 'Point' ? clusterFeature.geometry.coordinates : undefined
          if (!coordinates) {
            return
          }

          map.easeTo({
            center: coordinates as [number, number],
            zoom,
          })
        })
      })

      map.on('click', CLUB_LAYER_ID, (event) => {
        const feature = event.features?.[0]
        if (!feature || feature.geometry.type !== 'Point') {
          return
        }

        const name = typeof feature.properties?.name === 'string' ? feature.properties.name : undefined
        const region = typeof feature.properties?.region === 'string' ? feature.properties.region : ''
        const distance = typeof feature.properties?.distanceNm === 'number' ? feature.properties.distanceNm : ''

        if (!name) {
          return
        }

        new maplibregl.Popup({ offset: 12 })
          .setLngLat(feature.geometry.coordinates as [number, number])
          .setHTML(`<strong>${name}</strong><br/>${region}<br/>${distance} nm`)
          .addTo(map)

        onSelectClubRef.current?.(name)
      })

      map.on('mouseenter', CLUSTER_LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', CLUSTER_LAYER_ID, () => {
        map.getCanvas().style.cursor = ''
      })

      map.on('mouseenter', CLUB_LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', CLUB_LAYER_ID, () => {
        map.getCanvas().style.cursor = ''
      })

      map.fitBounds(INITIAL_PNW_BOUNDS, {
        padding: 36,
        duration: 0,
      })
    })

    map.on('error', (event) => {
      if (mapMode !== 'nautical') {
        // Surface non-nautical map loading failures during development.
        console.error('MapLibre error', event.error)
        return
      }

      if (!isNauticalSourceError(event)) {
        console.error('MapLibre error', event.error)
        return
      }

      const errorMessage =
        event.error instanceof Error ? event.error.message : 'Unknown chart source error'

      const loweredErrorMessage = errorMessage.toLowerCase()
      const isExpectedTransientError =
        loweredErrorMessage.includes('abort') ||
        loweredErrorMessage.includes('failed to fetch') ||
        loweredErrorMessage.includes('404')

      if (isExpectedTransientError) {
        return
      }

      markNauticalSourceError(errorMessage)

      if (nauticalSourceErrorCount < MAX_NAUTICAL_SOURCE_ERRORS_BEFORE_FALLBACK) {
        return
      }

      setLastNauticalError('PMTiles chart source unavailable.')
    })

    return () => {
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer)
      }
      if (hardFallbackTimer !== null) {
        window.clearTimeout(hardFallbackTimer)
      }
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
    }
    // The map is recreated when the selected basemap mode changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mapMode,
    mapStyle,
  ])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    if (!map.getSource(SOURCE_ID)) {
      map.once('load', () => {
        const pendingSource = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
        pendingSource?.setData(featureCollection)
      })
      return
    }

    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (source) {
      source.setData(featureCollection)
    }

    // Keep current viewport stable after initial load.
  }, [clubs, featureCollection, mapMode, mapStyle])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    const applySelectedClubStyle = () => {
      if (!map.getLayer(CLUB_LAYER_ID)) {
        return
      }

      map.setPaintProperty(CLUB_LAYER_ID, 'circle-color', [
        'case',
        ['==', ['get', 'name'], selectedClubName ?? ''],
        '#f97316',
        '#0891b2',
      ])

      const selectedClub = clubs.find((club) => club.name === selectedClubName)
      if (!selectedClub) {
        return
      }

      const targetZoom =
        mapMode === 'nautical' ? Math.max(map.getZoom(), 9) : map.getZoom()

      map.easeTo({
        center: [selectedClub.longitude, selectedClub.latitude],
        zoom: targetZoom,
        duration: 450,
      })
    }

    if (!map.getLayer(CLUB_LAYER_ID)) {
      map.once('load', applySelectedClubStyle)
      return
    }

    applySelectedClubStyle()
  }, [clubs, selectedClubName, mapStyle])

  return (
    <div className={css({ position: 'relative', w: 'full', h: 'full' })}>
      <div
        className={css({
          position: 'absolute',
          top: '3',
          right: '3',
          zIndex: 1,
          display: 'flex',
          gap: '1',
          rounded: 'full',
          border: '1px solid',
          borderColor: 'borderSubtle',
          bg: 'bgSurface',
          p: '1',
          boxShadow: 'md',
          opacity: 0.98,
        })}
      >
        <button
          className={css({
            cursor: 'pointer',
            rounded: 'full',
            px: '3',
            py: '1.5',
            fontSize: 'sm',
            fontWeight: '600',
            color: mapMode === 'nautical' ? 'textPrimary' : 'textMuted',
            bg: mapMode === 'nautical' ? 'bgCanvas' : 'bgSurface',
            boxShadow: mapMode === 'nautical' ? 'sm' : 'none',
          })}
          onClick={() => {
            setNoaaLoaded(false)
            setNoaaErrorCount(0)
            setLastNauticalError('')
            setMapMode('nautical')
          }}
          type="button"
        >
          Chart
        </button>
        <button
          className={css({
            cursor: 'pointer',
            rounded: 'full',
            px: '3',
            py: '1.5',
            fontSize: 'sm',
            fontWeight: '600',
            color: mapMode === 'standard' ? 'textPrimary' : 'textMuted',
            bg: mapMode === 'standard' ? 'bgCanvas' : 'bgSurface',
            boxShadow: mapMode === 'standard' ? 'sm' : 'none',
          })}
          onClick={() => setMapMode('standard')}
          type="button"
        >
          Standard
        </button>
      </div>
      {mapMode === 'nautical' ? (
        <div
          className={css({
            position: 'absolute',
            left: '3',
            bottom: '3',
            zIndex: 1,
            rounded: 'md',
            border: '1px solid',
            borderColor: 'borderSubtle',
            bg: 'bgSurface',
            px: '2.5',
            py: '1.5',
            fontSize: 'xs',
            color: 'textMuted',
            boxShadow: 'sm',
            opacity: 0.96,
          })}
        >
          {`Chart ${activeNauticalSourceLabel} • ${noaaLoaded ? 'tiles loaded' : 'loading'}${noaaErrorCount > 0 ? ` • errors ${noaaErrorCount}` : ''}${lastNauticalError ? ` • ${lastNauticalError}` : ''}`}
        </div>
      ) : null}
      <div
        aria-label="Club map"
        className={css({
          w: 'full',
          h: 'full',
          bg: 'bgCanvas',
        })}
        ref={containerRef}
        role="region"
      />
    </div>
  )
}
