import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Club } from '@/domain/club'
import { CHART_DETAIL_MIN_ZOOM } from '@/ui/map-constants'

const mapInstances: MockMap[] = []

class MockMap {
  handlers: Record<string, Array<(event?: unknown) => void>> = {}
  styleLoaded = true
  triggerRepaint = vi.fn()
  setStyle = vi.fn()
  addSource = vi.fn()
  addLayer = vi.fn()
  getSource = vi.fn()
  getLayer = vi.fn()
  fitBounds = vi.fn()
  remove = vi.fn()
  resize = vi.fn()
  on = vi.fn((type: string, handler: (event?: unknown) => void) => {
    ;(this.handlers[type] ??= []).push(handler)
  })
  off = vi.fn((type: string, handler: (event?: unknown) => void) => {
    this.handlers[type] = (this.handlers[type] ?? []).filter((candidate) => candidate !== handler)
  })
  once = vi.fn((type: string, handler: (event?: unknown) => void) => {
    const onceHandler = (event?: unknown) => {
      this.off(type, onceHandler)
      handler(event)
    }
    this.on(type, onceHandler)
  })
  getCanvas = vi.fn(() => ({ style: { cursor: '' } }))
  easeTo = vi.fn()
  getZoom = vi.fn(() => 8)
  isStyleLoaded = vi.fn(() => this.styleLoaded)
  queryRenderedFeatures = vi.fn(() => [])

  constructor(public options: unknown) {
    mapInstances.push(this)
  }

  emit(type: string, event?: unknown) {
    for (const handler of (this.handlers[type] ?? []).slice()) {
      handler(event)
    }
  }
}

vi.mock('maplibre-gl', () => {
  const addProtocol = vi.fn()
  const Popup = class {
    setLngLat() {
      return this
    }

    setHTML() {
      return this
    }

    addTo() {
      return this
    }
  }

  class Map {
    constructor(options: unknown) {
      return new MockMap(options)
    }
  }

  return {
    default: {
      Map,
      Popup,
      addProtocol,
    },
    __esModule: true,
  }
})

vi.mock('pmtiles', () => ({
  Protocol: class {
    tile = vi.fn()
  },
}))

import { MapView } from './map-view'

const clubs: Club[] = [
  {
    name: 'Port Madison Yacht Club',
    region: 'Puget Sound North',
    distanceNm: 6,
    website: 'https://example.com',
    address: '8478 NE Hidden Cove Rd, Bainbridge Island, WA 98110',
    longitude: -122.523,
    latitude: 47.626,
  },
]

beforeEach(() => {
  mapInstances.length = 0
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}

      disconnect() {}
    },
  )
})

afterEach(() => {
  cleanup()
})

describe('MapView nautical panning', () => {
  it('keeps the nautical chart layer alive when panning from Seattle toward Whidbey Island', async () => {
    render(<MapView clubs={clubs} />)

    await waitFor(() => expect(mapInstances).toHaveLength(1))
    const map = mapInstances[0]

    act(() => {
      map.emit('load')
    })

    const setStyleCallsBeforePan = map.setStyle.mock.calls.length

    act(() => {
      map.emit('move')
    })

    expect(map.triggerRepaint).toHaveBeenCalledTimes(1)
    expect(map.setStyle.mock.calls.length).toBe(setStyleCallsBeforePan)
    expect(map.addSource).toHaveBeenCalledTimes(1)
    expect(map.addLayer).toHaveBeenCalled()
  })
})

describe('MapView zoom indicator', () => {
  it('shows "zoom in for chart detail" when zoom is below CHART_DETAIL_MIN_ZOOM', async () => {
    render(<MapView clubs={clubs} />)

    await waitFor(() => expect(mapInstances).toHaveLength(1))
    const map = mapInstances[0]
    map.getZoom.mockReturnValue(CHART_DETAIL_MIN_ZOOM - 1)

    act(() => {
      map.emit('zoom')
    })

    expect(screen.getByText(/zoom in for chart detail/)).toBeTruthy()
  })

  it('hides "zoom in for chart detail" when zoom meets CHART_DETAIL_MIN_ZOOM', async () => {
    render(<MapView clubs={clubs} />)

    await waitFor(() => expect(mapInstances).toHaveLength(1))
    const map = mapInstances[0]
    map.getZoom.mockReturnValue(CHART_DETAIL_MIN_ZOOM)

    act(() => {
      map.emit('zoom')
    })

    expect(screen.queryByText(/zoom in for chart detail/)).toBeNull()
  })
})