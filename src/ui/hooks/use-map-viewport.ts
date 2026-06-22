import { useEffect, useState } from 'react'
import type maplibregl from 'maplibre-gl'

import type { Club } from '@/domain/club'
import {
  CLUB_LAYER_ID,
  CHART_DETAIL_MIN_ZOOM,
  INITIAL_PNW_BOUNDS,
} from '@/ui/map-constants'

export const useMapViewport = (
  map: maplibregl.Map | null,
  clubs: Club[],
  selectedClubName?: string,
) => {
  const [zoom, setZoom] = useState(4.5)

  // Zoom tracking — registered once after map creation.
  useEffect(() => {
    if (!map) return
    const track = () => setZoom(map.getZoom())
    map.on('zoom', track)
    map.on('zoomend', track)
    track()
    // skipcq: JS-0045
    return () => {
      map.off('zoom', track)
      map.off('zoomend', track)
    }
  }, [map])

  // Initial bounds fit — fires once when the map first becomes available.
  useEffect(() => {
    if (!map) return
    const fit = () => { map.fitBounds(INITIAL_PNW_BOUNDS, { padding: 36, duration: 0 }) }
    if (map.isStyleLoaded()) {
      fit()
    } else {
      map.once('load', fit)
      // skipcq: JS-0045
      return () => { map.off('load', fit) }
    }
  }, [map])

  // Club selection — highlight marker and fly to club.
  useEffect(() => {
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
  }, [clubs, map, selectedClubName])

  return { zoom }
}
