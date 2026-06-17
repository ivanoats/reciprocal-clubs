# 0006. Nautical Chart Basemap with NOAA Display Service

**Date:** 2026-06-17  
**Status:** Accepted

## Context

The interactive club map needed a nautical-oriented basemap that better
matches the maritime subject matter than a generic street map. The existing
MapLibre integration already supports client-side raster styles, so the
lowest-risk change is to enrich the base map with nautical detail rather than
introduce a new rendering stack.

Seamap was used as a reference for layered nautical cartography, source
attribution, and the idea that marine detail should sit above a stable base
layer. The repo does not need a full seamark/bathymetry generation pipeline
yet.

## Decision

Use NOAA Chart Display Service tiles as the nautical basemap in chart mode,
and keep OpenStreetMap as the standard mode. Keep the club markers and
interactions in the existing MapLibre client component, and expose an explicit
toggle so users can switch between chart and standard map presentations.

Support a configurable chart tile URL via environment variable so chart mode
can point at a local MBTiles-backed tile server (for example, NOAA MBTiles
regions 04-10 from `vokkim/noaa-nautical-charts`) without code changes.

Default chart tile requests go through a same-origin Next.js route proxy to
reduce browser CORS/runtime failures from direct third-party tile calls.

Support an optional PMTiles mode for chart source loading in MapLibre by using
the PMTiles protocol (`pmtiles://`). This allows direct use of a `.pmtiles`
archive URL while preserving the same chart/standard UI behavior.

The style includes:

- a neutral marine background color
- NOAA Chart Display Service tiles for chart mode
- OpenStreetMap raster tiles for standard mode
- a high-contrast, opaque UI toggle between chart and standard basemaps
- optional env-based override for a local MBTiles tile-server URL
- optional PMTiles source mode using `NEXT_PUBLIC_NAUTICAL_CHART_SOURCE_MODE`
  and `NEXT_PUBLIC_NAUTICAL_CHART_PMTILES_URL`
- explicit attribution for both data sources

## Consequences

- The map reads more like a nautical chart without introducing a new tile
  pipeline.
- The implementation stays client-side and compatible with the current
  MapLibre setup.
- If NOAA tiles are unavailable, users can switch to the standard OSM mode.
- If a local MBTiles service is configured, chart mode can run independently
  of NOAA live tile availability.
- If MBTiles are converted to PMTiles and served locally, chart mode can run
  with either XYZ tile requests or direct PMTiles archive loading.
- The map depends on third-party tile/glyph infrastructure unless self-hosted;
  provider availability, rate limits, and usage policies can affect runtime
  reliability.
- The proxy route improves client compatibility but adds a lightweight app-side
  runtime dependency for NOAA tile forwarding.
- Users can opt into a cleaner standard basemap without leaving the map view.
- The current approach is an interim nautical basemap, not a full ENC-style
  chart renderer.
