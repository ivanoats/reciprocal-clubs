'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'

import type { Club } from '@/domain/club'
import {
  type MapMode,
  SOURCE_ID,
  CLUSTER_LAYER_ID,
  CLUSTER_COUNT_LAYER_ID,
  CLUB_LAYER_ID,
  INITIAL_CENTER,
} from '@/ui/map-constants'
import { createBaseStyle, useMapStyle } from '@/ui/hooks/use-map-style'
import { useMapViewport } from '@/ui/hooks/use-map-viewport'
import { useNauticalSourceHealth } from '@/ui/hooks/use-nautical-source-health'
import { CHART_DETAIL_MIN_ZOOM } from '@/ui/map-constants'
import { css } from '../../../styled-system/css'

type MapViewProps = {
  clubs: Club[]
  selectedClubName?: string
  onSelectClub?: (clubName: string) => void
}

let hasRegisteredPmtilesProtocol = false

const buildFeatureCollection = (clubs: Club[]) => ({
  type: 'FeatureCollection' as const,
  features: clubs.map((club) => ({
    type: 'Feature' as const,
    properties: { name: club.name, region: club.region, distanceNm: club.distanceNm },
    geometry: {
      type: 'Point' as const,
      coordinates: [club.longitude, club.latitude] as [number, number],
    },
  })),
})

// Adds the GeoJSON source and club layers only — no event handlers, safe to call after each style swap.
const addClubLayers = (map: maplibregl.Map, data: ReturnType<typeof buildFeatureCollection>) => {
  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, { type: 'geojson', data, cluster: true, clusterMaxZoom: 9, clusterRadius: 42 })
  }

  if (!map.getLayer(CLUSTER_LAYER_ID)) {
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
  }

  if (!map.getLayer(CLUSTER_COUNT_LAYER_ID)) {
    map.addLayer({
      id: CLUSTER_COUNT_LAYER_ID,
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Open Sans Bold'], 'text-size': 12 },
      paint: { 'text-color': '#ffffff' },
    })
  }

  if (!map.getLayer(CLUB_LAYER_ID)) {
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
  }
}

export const MapView = ({ clubs, selectedClubName, onSelectClub }: MapViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const onSelectClubRef = useRef<MapViewProps['onSelectClub']>(onSelectClub)
  const featureCollectionRef = useRef<ReturnType<typeof buildFeatureCollection> | null>(null)
  const [mapMode, setMapMode] = useState<MapMode>('nautical')
  const [map, setMap] = useState<maplibregl.Map | null>(null)

  const mapStyle = useMapStyle(mapMode)
  const { zoom } = useMapViewport(map, clubs, selectedClubName)
  const { loaded: noaaLoaded, errorCount: noaaErrorCount, lastError: lastNauticalError } =
    useNauticalSourceHealth(map, mapMode)

  const activeNauticalSourceLabel = 'PMTiles'

  const featureCollection = useMemo(() => buildFeatureCollection(clubs), [clubs])

  useEffect(() => {
    featureCollectionRef.current = featureCollection
  }, [featureCollection])

  useEffect(() => {
    onSelectClubRef.current = onSelectClub
  }, [onSelectClub])

  useEffect(() => {
    if (hasRegisteredPmtilesProtocol) return
    const protocol = new Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)
    hasRegisteredPmtilesProtocol = true
  }, [])

  // Stable map creation — runs once on mount, never on mode/style changes.
  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: createBaseStyle('nautical'),
      center: INITIAL_CENTER,
      zoom: 4.5,
      cancelPendingTileRequestsWhileZooming: false,
    })
    mapRef.current = map
    setMap(map)

    const resizeObserver = new ResizeObserver(() => map.resize())
    resizeObserver.observe(containerRef.current)

    map.on('move', () => map.triggerRepaint())

    map.on('load', () => {
      addClubLayers(map, featureCollectionRef.current ?? buildFeatureCollection([]))

      map.on('click', CLUSTER_LAYER_ID, (event) => {
        const features = map.queryRenderedFeatures(event.point, { layers: [CLUSTER_LAYER_ID] })
        const clusterFeature = features[0]
        if (!clusterFeature) return
        const clusterId = clusterFeature.properties?.cluster_id as number | undefined
        const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
        if (!source || clusterId === undefined) return
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          const coords = clusterFeature.geometry?.type === 'Point' ? clusterFeature.geometry.coordinates : undefined
          if (!coords) return
          map.easeTo({ center: coords as [number, number], zoom })
        })
      })

      map.on('click', CLUB_LAYER_ID, (event) => {
        const feature = event.features?.[0]
        if (!feature || feature.geometry.type !== 'Point') return
        const name = typeof feature.properties?.name === 'string' ? feature.properties.name : undefined
        const region = typeof feature.properties?.region === 'string' ? feature.properties.region : ''
        const distance = typeof feature.properties?.distanceNm === 'number' ? feature.properties.distanceNm : ''
        if (!name) return

        const popupContent = `
          <div style="font-family: var(--font-manrope), system-ui, -apple-system, sans-serif; padding: 6px 4px; min-width: 160px;">
            <p style="margin: 0; font-family: var(--font-space-grotesk), system-ui, -apple-system, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.3;">${name}</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 500; color: #475569;">${region}</p>
            <p style="margin: 6px 0 0 0; font-size: 11px; font-weight: 700; color: #0891b2; display: flex; align-items: center; gap: 4px;">⛵ ${distance} nm</p>
          </div>
        `

        new maplibregl.Popup({ offset: 12 })
          .setLngLat(feature.geometry.coordinates as [number, number])
          .setHTML(popupContent)
          .addTo(map)
        onSelectClubRef.current?.(name)
      })

      map.on('mouseenter', CLUSTER_LAYER_ID, () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', CLUSTER_LAYER_ID, () => { map.getCanvas().style.cursor = '' })
      map.on('mouseenter', CLUB_LAYER_ID, () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', CLUB_LAYER_ID, () => { map.getCanvas().style.cursor = '' })
    })

    // skipcq: JS-0045
    return () => {
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
      setMap(null)
    }
  }, [])

  // Style swap — preserves viewport when the basemap mode changes.
  const lastStyleRef = useRef(mapStyle)

  useEffect(() => {
    if (!map) return
    if (lastStyleRef.current === mapStyle) return

    lastStyleRef.current = mapStyle
    map.setStyle(mapStyle)
    map.once('styledata', () => {
      addClubLayers(map, featureCollectionRef.current ?? buildFeatureCollection([]))
    })
  }, [map, mapStyle])

  // GeoJSON data update — pushes new club data to the existing source.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!map.getSource(SOURCE_ID)) {
      map.once('load', () => {
        const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
        source?.setData(featureCollection)
      })
      return
    }
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    source?.setData(featureCollection)
  }, [featureCollection])

  return (
    <div className={css({ position: 'relative', w: 'full', h: 'full' })}>
      <div
        className={css({
          position: 'absolute',
          top: '3.5',
          right: '3.5',
          zIndex: 1,
          display: 'flex',
          gap: '1',
          rounded: 'xl',
          borderWidth: '1px',
          borderColor: 'borderSubtle',
          bg: { base: 'rgba(255, 255, 255, 0.75)', _dark: 'rgba(15, 23, 42, 0.65)' },
          backdropFilter: 'blur(8px)',
          p: '1',
          boxShadow: 'md',
        })}
      >
        {(['nautical', 'standard', 'wmts'] as const).map((mode) => {
          const isActive = mapMode === mode
          const labels: Record<MapMode, string> = {
            nautical: 'Chart',
            standard: 'Standard',
            wmts: 'SeaMarks',
          }
          return (
            <button
              key={mode}
              className={css({
                cursor: 'pointer',
                rounded: 'lg',
                px: '3.5',
                py: '1.5',
                fontSize: 'xs',
                fontWeight: '700',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                color: isActive ? 'white' : 'textMuted',
                bgGradient: isActive ? 'to-br' : 'none',
                gradientFrom: isActive ? 'cyan.500' : 'none',
                gradientTo: isActive ? 'blue.600' : 'none',
                boxShadow: isActive ? '0 2px 6px 0 rgba(6, 182, 212, 0.25)' : 'none',
                _hover: {
                  color: isActive ? 'white' : 'textPrimary',
                  bg: isActive ? 'none' : 'bgHover',
                },
              })}
              onClick={() => setMapMode(mode)}
              aria-pressed={isActive}
              type="button"
            >
              {labels[mode]}
            </button>
          )
        })}
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
          {[
            `Chart ${activeNauticalSourceLabel}`,
            noaaLoaded ? 'tiles loaded' : 'loading',
            noaaErrorCount > 0 ? `errors ${noaaErrorCount}` : '',
            lastNauticalError,
            zoom < CHART_DETAIL_MIN_ZOOM ? 'zoom in for chart detail' : '',
          ].filter(Boolean).join(' • ')}
        </div>
      ) : mapMode === 'wmts' ? (
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
          Nautical Overlay • OpenSeaMap contributors
        </div>
      ) : null}

      <div
        aria-label="Club map"
        className={css({ w: 'full', h: 'full', bg: 'bgCanvas' })}
        ref={containerRef}
        role="region"
      />
    </div>
  )
}
