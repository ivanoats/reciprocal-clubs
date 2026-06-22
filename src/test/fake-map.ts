import type maplibregl from 'maplibre-gl'

type Handler = (event?: unknown) => void
// A once() wrapper carries a reference to the original handler so that off()
// can match either the wrapper or the original, mirroring MapLibre/EventEmitter
// semantics where `off(type, handler)` removes a listener added via `once`.
type OnceHandler = Handler & { original?: Handler }

// Minimal MapLibre stand-in for hook tests: an event emitter with the
// handful of methods our hooks call. Cast to maplibregl.Map at the call site.
export class FakeMap {
  handlers: Record<string, Handler[]> = {}
  styleLoaded = false
  zoomValue = 4.5
  layers = new Set<string>()
  paintProps: Record<string, unknown> = {}
  easeToCalls: unknown[] = []
  fitBoundsCalls: unknown[] = []

  on(type: string, handler: Handler) {
    ;(this.handlers[type] ??= []).push(handler)
  }

  off(type: string, handler: Handler) {
    this.handlers[type] = (this.handlers[type] ?? []).filter(
      (h) => h !== handler && (h as OnceHandler).original !== handler,
    )
  }

  once(type: string, handler: Handler) {
    const wrapper: OnceHandler = (event) => {
      this.off(type, wrapper)
      handler(event)
    }
    wrapper.original = handler
    this.on(type, wrapper)
  }

  emit(type: string, event?: unknown) {
    ;(this.handlers[type] ?? []).slice().forEach((handler) => handler(event))
  }

  handlerCount(type: string) {
    return (this.handlers[type] ?? []).length
  }

  isStyleLoaded() {
    return this.styleLoaded
  }

  getZoom() {
    return this.zoomValue
  }

  getLayer(id: string) {
    return this.layers.has(id) ? { id } : undefined
  }

  setPaintProperty(layer: string, prop: string, value: unknown) {
    this.paintProps[`${layer}.${prop}`] = value
  }

  easeTo(options: unknown) {
    this.easeToCalls.push(options)
  }

  fitBounds(bounds: unknown, options: unknown) {
    this.fitBoundsCalls.push({ bounds, options })
  }
}

export const asMap = (fake: FakeMap): maplibregl.Map => fake as unknown as maplibregl.Map
