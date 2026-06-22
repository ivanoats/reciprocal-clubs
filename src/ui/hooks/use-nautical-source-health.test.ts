import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useNauticalSourceHealth } from './use-nautical-source-health'
import { MAX_NAUTICAL_SOURCE_ERRORS_BEFORE_FALLBACK } from '@/ui/map-constants'
import { FakeMap, asMap } from '@/test/fake-map'

const sourceDataEvent = (sourceId: string) => ({ sourceId, sourceDataType: 'content' })
const errorEvent = (message: string, sourceId?: string) => ({
  error: new Error(message),
  ...(sourceId ? { sourceId } : {}),
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useNauticalSourceHealth', () => {
  it('returns idle state when there is no map', () => {
    const { result } = renderHook(() => useNauticalSourceHealth(null, 'nautical'))
    expect(result.current).toEqual({ loaded: false, errorCount: 0, lastError: '' })
  })

  it('marks loaded when a noaa source finishes loading', () => {
    const map = new FakeMap()
    const { result } = renderHook(() => useNauticalSourceHealth(asMap(map), 'nautical'))

    act(() => map.emit('sourcedata', sourceDataEvent('noaa-0')))
    expect(result.current.loaded).toBe(true)
  })

  it('ignores source data from non-noaa sources', () => {
    const map = new FakeMap()
    const { result } = renderHook(() => useNauticalSourceHealth(asMap(map), 'nautical'))

    act(() => map.emit('sourcedata', sourceDataEvent('osm')))
    expect(result.current.loaded).toBe(false)
  })

  it('counts non-transient nautical errors and records the message', () => {
    const map = new FakeMap()
    const { result } = renderHook(() => useNauticalSourceHealth(asMap(map), 'nautical'))

    act(() => map.emit('error', errorEvent('pmtiles archive corrupt')))
    expect(result.current.errorCount).toBe(1)
    expect(result.current.lastError).toBe('pmtiles archive corrupt')
  })

  it('ignores transient errors (abort, failed to fetch, 404)', () => {
    const map = new FakeMap()
    const { result } = renderHook(() => useNauticalSourceHealth(asMap(map), 'nautical'))

    act(() => {
      map.emit('error', errorEvent('Request aborted', 'noaa-0'))
      map.emit('error', errorEvent('Failed to fetch', 'noaa-0'))
      map.emit('error', errorEvent('Tile 404 not found', 'noaa-0'))
    })
    expect(result.current.errorCount).toBe(0)
  })

  it('shows the unavailable message after reaching the error threshold', () => {
    const map = new FakeMap()
    const { result } = renderHook(() => useNauticalSourceHealth(asMap(map), 'nautical'))

    act(() => {
      for (let i = 0; i < MAX_NAUTICAL_SOURCE_ERRORS_BEFORE_FALLBACK; i += 1) {
        map.emit('error', errorEvent('pmtiles decode failed'))
      }
    })
    expect(result.current.errorCount).toBe(MAX_NAUTICAL_SOURCE_ERRORS_BEFORE_FALLBACK)
    expect(result.current.lastError).toBe('PMTiles chart source unavailable.')
  })

  it('does not count WMTS source errors as nautical health (PR #9 regression guard)', () => {
    const map = new FakeMap()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHook(() => useNauticalSourceHealth(asMap(map), 'wmts'))

    act(() => map.emit('error', errorEvent('tile load error', 'wmts-noaa-charts')))
    expect(result.current.errorCount).toBe(0)
    errorSpy.mockRestore()
  })

  it('resets state when the map mode changes', () => {
    const map = new FakeMap()
    const { result, rerender } = renderHook(
      ({ mode }) => useNauticalSourceHealth(asMap(map), mode),
      { initialProps: { mode: 'nautical' as const } },
    )

    act(() => map.emit('error', errorEvent('pmtiles decode failed')))
    expect(result.current.errorCount).toBe(1)

    rerender({ mode: 'standard' as const })
    expect(result.current).toEqual({ loaded: false, errorCount: 0, lastError: '' })
  })

  it('reports a slow-source message once the soft timeout elapses in nautical mode', () => {
    vi.useFakeTimers()
    const map = new FakeMap()
    const { result } = renderHook(() => useNauticalSourceHealth(asMap(map), 'nautical'))

    act(() => {
      vi.advanceTimersByTime(9000)
    })
    expect(result.current.lastError).toContain('slow to respond')
  })

  it('detaches its listeners on unmount', () => {
    const map = new FakeMap()
    const { unmount } = renderHook(() => useNauticalSourceHealth(asMap(map), 'nautical'))

    expect(map.handlerCount('error')).toBe(1)
    unmount()
    expect(map.handlerCount('error')).toBe(0)
    expect(map.handlerCount('sourcedata')).toBe(0)
  })
})
