# 0006. Nautical Chart Basemap with PMTiles Delivery

**Date:** 2026-06-17  
**Status:** Accepted

## Context

The interactive club map needed a nautical-oriented basemap that better
matches the maritime subject matter than a generic street map. The existing
MapLibre integration already supports client-side raster styles, so the
lowest-risk change is to enrich the base map with nautical detail rather than
introduce a new rendering stack.

Early iterations used NOAA/XYZ fallback paths, but this created inconsistent
visual behavior and undesirable fallback basemaps. We need deterministic chart
behavior where chart mode is either real chart tiles or blank.

## Decision

Use PMTiles archives as the chart source in chart mode via MapLibre + PMTiles
protocol (`pmtiles://`) and keep OpenStreetMap as the standard mode.

Chart mode is PMTiles-only and does not switch to NOAA/XYZ/OpenSeaMap fallback
layers at runtime.

The PMTiles archive is delivered from Cloudflare R2 through a Cloudflare Worker
endpoint that provides CORS and HTTP range support.

The style includes:

- a neutral marine background color
- PMTiles chart tiles for chart mode
- OpenStreetMap raster tiles for standard mode
- a high-contrast, opaque UI toggle between chart and standard basemaps
- PMTiles archive URL wiring with `NEXT_PUBLIC_NAUTICAL_CHART_PMTILES_URL`
- explicit attribution for chart and standard basemaps

## Consequences

- The map reads more like a nautical chart without introducing a new tile
  pipeline.
- The implementation stays client-side and compatible with the current
  MapLibre setup.
- If chart PMTiles are unavailable, chart mode remains blank and users can
  switch to standard mode.
- If MBTiles are converted to PMTiles and served locally or from Cloudflare,
  chart mode can run without direct NOAA service dependencies.
- The map depends on third-party tile/glyph infrastructure unless self-hosted;
  provider availability, rate limits, and usage policies can affect runtime
  reliability.
- Cloudflare Worker adds a small operational surface area (deployment,
  credentials, bucket management) but centralizes CORS/range behavior.
- Users can opt into a cleaner standard basemap without leaving the map view.
- The current approach is an interim nautical basemap, not a full ENC-style
  chart renderer.
