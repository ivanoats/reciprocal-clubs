import { useEffect, useState } from 'react'
import type maplibregl from 'maplibre-gl'

import {
  type MapMode,
  SOFT_FALLBACK_TIMEOUT_MS,
  HARD_FALLBACK_TIMEOUT_MS,
  MAX_NAUTICAL_SOURCE_ERRORS_BEFORE_FALLBACK,
} from '@/ui/map-constants'

const isNauticalSourceError = (event: maplibregl.ErrorEvent): boolean => {
  const sourceId = (event as { sourceId?: string }).sourceId
  if (sourceId === 'noaa') return true
  const message =
    event.error instanceof Error ? event.error.message.toLowerCase() : String(event.error).toLowerCase()
  return message.includes('pmtiles') || message.includes('source "noaa"') || message.includes('noaa')
}

const isNoaaSourceDataEvent = (event: maplibregl.MapSourceDataEvent): boolean => {
  const sourceId = (event as { sourceId?: string }).sourceId
  const isSourceLoaded = (event as { isSourceLoaded?: boolean }).isSourceLoaded
  const sourceDataType = (event as { sourceDataType?: string }).sourceDataType
  return sourceId === 'noaa' && (!!isSourceLoaded || sourceDataType === 'content')
}

export const useNauticalSourceHealth = (
  mapRef: React.RefObject<maplibregl.Map | null>,
  mapMode: MapMode,
) => {
  const [loaded, setLoaded] = useState(false)
  const [errorCount, setErrorCount] = useState(0)
  const [lastError, setLastError] = useState('')

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    let localErrorCount = 0
    let hasLoaded = false

    const onSourceData = (event: maplibregl.MapSourceDataEvent) => {
      if (!isNoaaSourceDataEvent(event)) return
      hasLoaded = true
      setLoaded(true)
      setLastError('')
    }

    const onError = (event: maplibregl.ErrorEvent) => {
      if (!isNauticalSourceError(event)) {
        if (mapMode !== 'nautical') console.error('MapLibre error', event.error)
        return
      }

      const message = event.error instanceof Error ? event.error.message : 'Unknown chart source error'
      const lower = message.toLowerCase()
      const isTransient =
        lower.includes('abort') || lower.includes('failed to fetch') || lower.includes('404')
      if (isTransient) return

      localErrorCount += 1
      setErrorCount((n) => n + 1)
      setLastError(message)

      if (localErrorCount >= MAX_NAUTICAL_SOURCE_ERRORS_BEFORE_FALLBACK) {
        setLastError('PMTiles chart source unavailable.')
      }
    }

    map.on('sourcedata', onSourceData)
    map.on('error', onError)

    const softTimer =
      mapMode === 'nautical'
        ? window.setTimeout(() => {
            if (!hasLoaded) setLastError('Chart source is slow to respond; waiting before fallback.')
          }, SOFT_FALLBACK_TIMEOUT_MS)
        : null

    const hardTimer =
      mapMode === 'nautical'
        ? window.setTimeout(() => {
            if (!hasLoaded) setLastError('PMTiles chart source unavailable.')
          }, HARD_FALLBACK_TIMEOUT_MS)
        : null

    return () => {
      map.off('sourcedata', onSourceData)
      map.off('error', onError)
      if (softTimer !== null) window.clearTimeout(softTimer)
      if (hardTimer !== null) window.clearTimeout(hardTimer)
    }
  }, [mapRef, mapMode])

  return { loaded, errorCount, lastError }
}
