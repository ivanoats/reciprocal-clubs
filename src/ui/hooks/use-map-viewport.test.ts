import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useMapViewport } from './use-map-viewport'
import { CLUB_LAYER_ID } from '@/ui/map-constants'
import type { Club } from '@/domain/club'
import { FakeMap, asMap } from '@/test/fake-map'

const club = (name: string, longitude: number, latitude: number): Club => ({
  name,
  region: 'Puget Sound South',
  distanceNm: 10,
  website: 'https://example.com',
  address: 'somewhere',
  longitude,
  latitude,
})

describe('useMapViewport', () => {
  it('returns the default zoom when there is no map', () => {
    const { result } = renderHook(() => useMapViewport(null, []))
    expect(result.current.zoom).toBe(4.5)
  })

  it('tracks zoom changes from map zoom events', () => {
    const map = new FakeMap()
    map.zoomValue = 9
    const { result } = renderHook(() => useMapViewport(asMap(map), []))

    // track() runs immediately on registration
    expect(result.current.zoom).toBe(9)

    map.zoomValue = 13
    act(() => map.emit('zoom'))
    expect(result.current.zoom).toBe(13)
  })

  it('fits the PNW bounds immediately when the style is already loaded', () => {
    const map = new FakeMap()
    map.styleLoaded = true
    renderHook(() => useMapViewport(asMap(map), []))
    expect(map.fitBoundsCalls).toHaveLength(1)
  })

  it('defers the bounds fit to the load event when the style is not ready', () => {
    const map = new FakeMap()
    map.styleLoaded = false
    renderHook(() => useMapViewport(asMap(map), []))

    expect(map.fitBoundsCalls).toHaveLength(0)
    act(() => map.emit('load'))
    expect(map.fitBoundsCalls).toHaveLength(1)
  })

  it('highlights and flies to the selected club when its layer exists', () => {
    const map = new FakeMap()
    map.styleLoaded = true
    map.layers.add(CLUB_LAYER_ID)
    const clubs = [club('Selected YC', -122.4, 47.6), club('Other YC', -123.1, 49.2)]

    renderHook(() => useMapViewport(asMap(map), clubs, 'Selected YC'))

    expect(map.paintProps[`${CLUB_LAYER_ID}.circle-color`]).toBeDefined()
    expect(map.easeToCalls).toHaveLength(1)
    expect(map.easeToCalls[0]).toMatchObject({ center: [-122.4, 47.6] })
  })

  it('waits for load before applying selection when the layer is absent', () => {
    const map = new FakeMap()
    const clubs = [club('Selected YC', -122.4, 47.6)]

    renderHook(() => useMapViewport(asMap(map), clubs, 'Selected YC'))
    // No layer yet → nothing applied
    expect(map.easeToCalls).toHaveLength(0)

    map.layers.add(CLUB_LAYER_ID)
    act(() => map.emit('load'))
    expect(map.easeToCalls).toHaveLength(1)
  })
})
