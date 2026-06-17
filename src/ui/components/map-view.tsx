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
type NauticalChartSourceMode = 'xyz' | 'pmtiles'

const SOURCE_ID = 'clubs-source'
const CLUSTER_LAYER_ID = 'clusters'
const CLUSTER_COUNT_LAYER_ID = 'cluster-count'
const CLUB_LAYER_ID = 'unclustered-club'
const INITIAL_CENTER: [number, number] = [-122.3321, 47.6062]
const DEFAULT_NOAA_CHART_TILE_URL = '/api/noaa-tiles/{z}/{y}/{x}'
const DEFAULT_GLYPHS_URL = 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
const RAW_NAUTICAL_CHART_SOURCE_MODE =
  process.env.NEXT_PUBLIC_NAUTICAL_CHART_SOURCE_MODE?.trim().toLowerCase() ||
  'xyz'
const NAUTICAL_CHART_SOURCE_MODE: NauticalChartSourceMode =
  RAW_NAUTICAL_CHART_SOURCE_MODE === 'pmtiles' ? 'pmtiles' : 'xyz'
const NOAA_CHART_TILE_URL_RAW = process.env.NEXT_PUBLIC_NAUTICAL_CHART_TILE_URL?.trim()
const MAPLIBRE_GLYPHS_URL =
  process.env.NEXT_PUBLIC_MAPLIBRE_GLYPHS_URL?.trim() || DEFAULT_GLYPHS_URL
const PMTILES_ARCHIVE_URL_RAW =
  process.env.NEXT_PUBLIC_NAUTICAL_CHART_PMTILES_URL?.trim() ||
  'http://localhost:8081/noaa_regions_04_10.pmtiles'
const PMTILES_ARCHIVE_URL = PMTILES_ARCHIVE_URL_RAW.startsWith('pmtiles://')
  ? PMTILES_ARCHIVE_URL_RAW
  : `pmtiles://${PMTILES_ARCHIVE_URL_RAW}`
const NOAA_CHART_ATTRIBUTION =
  process.env.NEXT_PUBLIC_NAUTICAL_CHART_ATTRIBUTION?.trim() ||
  '&copy; NOAA Office of Coast Survey'

const isValidXyzTemplateUrl = (url: string) =>
  url.includes('{z}') && url.includes('{x}') && url.includes('{y}')

const NOAA_CHART_TILE_URL =
  NOAA_CHART_TILE_URL_RAW && isValidXyzTemplateUrl(NOAA_CHART_TILE_URL_RAW)
    ? NOAA_CHART_TILE_URL_RAW
    : DEFAULT_NOAA_CHART_TILE_URL

const HAS_CUSTOM_NOAA_TILE_URL =
  Boolean(NOAA_CHART_TILE_URL_RAW) && NOAA_CHART_TILE_URL !== DEFAULT_NOAA_CHART_TILE_URL

let hasRegisteredPmtilesProtocol = false

const getNauticalSourceConfig = (
  sourceMode: NauticalChartSourceMode,
  noaaTileUrl: string,
) => {
  if (sourceMode === 'pmtiles') {
    return {
      type: 'raster' as const,
      url: PMTILES_ARCHIVE_URL,
      tileSize: 256,
      attribution: NOAA_CHART_ATTRIBUTION,
    }
  }

  return {
    type: 'raster' as const,
    tiles: [noaaTileUrl],
    tileSize: 256,
    attribution: NOAA_CHART_ATTRIBUTION,
  }
}

const createBaseStyle = (
  mapMode: MapMode,
  nauticalSourceMode: NauticalChartSourceMode,
  noaaTileUrl: string,
): StyleSpecification => {
  const isNautical = mapMode === 'nautical'
  const baseSourceId = isNautical ? 'noaa' : 'osm'

  const layers: NonNullable<StyleSpecification['layers']> = [
    {
      id: 'base-map',
      type: 'raster',
      source: baseSourceId,
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
        ...getNauticalSourceConfig(nauticalSourceMode, noaaTileUrl),
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
  const [useNauticalXyzModeFallback, setUseNauticalXyzModeFallback] = useState(false)
  const [useDefaultNoaaTileFallback, setUseDefaultNoaaTileFallback] = useState(false)
  const nauticalSourceMode = useNauticalXyzModeFallback ? 'xyz' : NAUTICAL_CHART_SOURCE_MODE
  const noaaTileUrl = useDefaultNoaaTileFallback
    ? DEFAULT_NOAA_CHART_TILE_URL
    : NOAA_CHART_TILE_URL
  const mapStyle = useMemo(
    () => createBaseStyle(mapMode, nauticalSourceMode, noaaTileUrl),
    [mapMode, nauticalSourceMode, noaaTileUrl],
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
    if (NOAA_CHART_TILE_URL_RAW && !isValidXyzTemplateUrl(NOAA_CHART_TILE_URL_RAW)) {
      console.warn(
        'NEXT_PUBLIC_NAUTICAL_CHART_TILE_URL must include {z}, {x}, and {y}; falling back to default NOAA tiles.',
      )
    }
  }, [])

  useEffect(() => {
    if (NAUTICAL_CHART_SOURCE_MODE !== 'pmtiles' || hasRegisteredPmtilesProtocol) {
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

    const fallbackToXyzMode = () => {
      if (
        mapMode === 'nautical' &&
        nauticalSourceMode === 'pmtiles' &&
        !useNauticalXyzModeFallback
      ) {
        console.warn('PMTiles nautical source failed; falling back to NOAA XYZ tiles.')
        setUseNauticalXyzModeFallback(true)
      }
    }

    const fallbackToDefaultNoaaTiles = () => {
      if (
        mapMode === 'nautical' &&
        nauticalSourceMode === 'xyz' &&
        HAS_CUSTOM_NOAA_TILE_URL &&
        !useDefaultNoaaTileFallback
      ) {
        console.warn('Custom nautical XYZ source failed; falling back to default NOAA tiles.')
        setUseDefaultNoaaTileFallback(true)
      }
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: INITIAL_CENTER,
      zoom: 4.5,
    })
    mapRef.current = map

    const fallbackTimer =
      mapMode === 'nautical'
        ? window.setTimeout(() => {
            if (!hasLoadedNauticalSource) {
              if (nauticalSourceMode === 'pmtiles') {
                fallbackToXyzMode()
              } else {
                fallbackToDefaultNoaaTiles()
              }
            }
          }, 2500)
        : null

    map.on('sourcedata', (event) => {
      const sourceId = (event as { sourceId?: string }).sourceId
      const isSourceLoaded = (event as { isSourceLoaded?: boolean }).isSourceLoaded

      if (sourceId === 'noaa' && isSourceLoaded) {
        hasLoadedNauticalSource = true
      }
    })

    const resizeObserver = new ResizeObserver(() => {
      map.resize()
    })
    resizeObserver.observe(containerRef.current)

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

      const bounds = new maplibregl.LngLatBounds()
      clubs.forEach((club) => bounds.extend([club.longitude, club.latitude]))

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: 48,
          maxZoom: 8,
        })
      }
    })

    map.on('error', (event) => {
      // Surface map loading failures during development.
      console.error('MapLibre error', event.error)

      if (mapMode !== 'nautical') {
        return
      }

      if (nauticalSourceMode === 'pmtiles') {
        fallbackToXyzMode()
      } else {
        fallbackToDefaultNoaaTiles()
      }
    })

    return () => {
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer)
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
    nauticalSourceMode,
    useNauticalXyzModeFallback,
    useDefaultNoaaTileFallback,
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

    const bounds = new maplibregl.LngLatBounds()
    clubs.forEach((club) => bounds.extend([club.longitude, club.latitude]))

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: 48,
        maxZoom: 8,
      })
    }
  }, [clubs, featureCollection, mapStyle])

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

      map.easeTo({
        center: [selectedClub.longitude, selectedClub.latitude],
        zoom: Math.max(map.getZoom(), 12),
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
          onClick={() => setMapMode('nautical')}
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
