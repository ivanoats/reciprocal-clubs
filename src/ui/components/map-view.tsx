'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'

import type { Club } from '@/domain/club'
import {
  SOURCE_ID,
  CLUSTER_LAYER_ID,
  CLUSTER_COUNT_LAYER_ID,
  CLUB_LAYER_ID,
  INITIAL_CENTER,
} from '@/ui/map-constants'
import { createBaseStyle, useMapStyle } from '@/ui/hooks/use-map-style'
import { useMapViewport } from '@/ui/hooks/use-map-viewport'
import { useNauticalSourceHealth } from '@/ui/hooks/use-nautical-source-health'
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
  const [mapMode, setMapMode] = useState<'nautical' | 'standard'>('nautical')

  const mapStyle = useMapStyle(mapMode)
  const { zoom } = useMapViewport(mapRef, clubs, selectedClubName)
  const { loaded: noaaLoaded, errorCount: noaaErrorCount, lastError: lastNauticalError } =
    useNauticalSourceHealth(mapRef, mapMode)

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
        new maplibregl.Popup({ offset: 12 })
          .setLngLat(feature.geometry.coordinates as [number, number])
          .setHTML(`<strong>${name}</strong><br/>${region}<br/>${distance} nm`)
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
    }
  }, [])

  // Style swap — preserves viewport when the basemap mode changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    map.setStyle(mapStyle)
    map.once('styledata', () => {
      addClubLayers(map, featureCollectionRef.current ?? buildFeatureCollection([]))
    })
  }, [mapStyle])

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

      {mapMode === 'nautical' && zoom < 12 ? (
        <div
          className={css({
            position: 'absolute',
            top: '3',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'borderSubtle',
            bg: 'bgSurface',
            pl: '3',
            pr: '1',
            py: '1',
            fontSize: 'xs',
            color: 'textMuted',
            boxShadow: 'md',
            opacity: 0.98,
          })}
          role="status"
        >
          <span>Zoom in for chart detail</span>
          <button
            className={css({
              cursor: 'pointer',
              rounded: 'full',
              px: '2.5',
              py: '1',
              fontSize: 'xs',
              fontWeight: '600',
              color: 'textPrimary',
              bg: 'bgCanvas',
              border: '1px solid',
              borderColor: 'borderSubtle',
            })}
            onClick={() => {
              mapRef.current?.easeTo({ center: INITIAL_CENTER, zoom: 12, duration: 500 })
            }}
            type="button"
          >
            Zoom to 12
          </button>
        </div>
      ) : null}

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
        className={css({ w: 'full', h: 'full', bg: 'bgCanvas' })}
        ref={containerRef}
        role="region"
      />
    </div>
  )
}
