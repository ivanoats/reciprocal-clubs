'use client'

import { useEffect, useMemo, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'

import type { Club } from '@/domain/club'
import { css } from '../../../styled-system/css'

type MapViewProps = {
  clubs: Club[]
  selectedClubName?: string
  onSelectClub?: (clubName: string) => void
}

const SOURCE_ID = 'clubs-source'
const CLUSTER_LAYER_ID = 'clusters'
const CLUSTER_COUNT_LAYER_ID = 'cluster-count'
const CLUB_LAYER_ID = 'unclustered-club'
const INITIAL_CENTER: [number, number] = [-122.3321, 47.6062]

const BASE_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-base',
      type: 'raster',
      source: 'osm',
    },
  ],
}

export const MapView = ({ clubs, selectedClubName, onSelectClub }: MapViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const onSelectClubRef = useRef<MapViewProps['onSelectClub']>(onSelectClub)

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
    if (!containerRef.current) {
      return
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_MAP_STYLE,
      center: INITIAL_CENTER,
      zoom: 4.5,
    })
    mapRef.current = map

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
    })

    return () => {
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
    }
    // Map is created once on mount; data updates flow through the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  }, [clubs, featureCollection])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.getLayer(CLUB_LAYER_ID)) {
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
      zoom: Math.max(map.getZoom(), 7),
      duration: 450,
    })
  }, [clubs, selectedClubName])

  return <div aria-label="Club map" className={css({ w: 'full', h: 'full' })} ref={containerRef} role="region" />
}
