import { useEffect, useRef, useState } from 'react'
import type maplibregl from 'maplibre-gl'

import type { Club } from '@/domain/club'
import {
  CLUB_LAYER_ID,
  CHART_DETAIL_MIN_ZOOM,
  INITIAL_PNW_BOUNDS,
} from '@/ui/map-constants'

export const useMapViewport = (
  mapRef: React.RefObject<maplibregl.Map | null>,
  clubs: Club[],
  selectedClubName: string | undefined,
) => {
  const [zoom, setZoom] = useState(4.5)
  const clubsRef = useRef(clubs)
  clubsRef.current = clubs
  const selectedClubNameRef = useRef(selectedClubName)
  selectedClubNameRef.current = selectedClubName

  // Zoom tracking — registered once after map creation.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const track = () => setZoom(map.getZoom())
    map.on('zoom', track)
    map.on('zoomend', track)
    setZoom(map.getZoom())
    return () => {
      map.off('zoom', track)
      map.off('zoomend', track)
    }
    // mapRef identity is stable; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Initial bounds fit — fires once when the map first loads.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.once('load', () => {
      map.fitBounds(INITIAL_PNW_BOUNDS, { padding: 36, duration: 0 })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Club selection — highlight marker and fly to club.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const apply = () => {
      if (!map.getLayer(CLUB_LAYER_ID)) return

      map.setPaintProperty(CLUB_LAYER_ID, 'circle-color', [
        'case',
        ['==', ['get', 'name'], selectedClubName ?? ''],
        '#f97316',
        '#0891b2',
      ])

      const selectedClub = clubs.find((c) => c.name === selectedClubName)
      if (!selectedClub) return

      map.easeTo({
        center: [selectedClub.longitude, selectedClub.latitude],
        zoom: Math.max(map.getZoom(), CHART_DETAIL_MIN_ZOOM),
        duration: 450,
      })
    }

    if (!map.getLayer(CLUB_LAYER_ID)) {
      map.once('load', apply)
      return
    }
    apply()
  }, [clubs, selectedClubName])

  return { zoom }
}
