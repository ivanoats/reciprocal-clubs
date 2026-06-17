# 0006. Nautical Chart Basemap with OpenSeaMap Overlay

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

Use a raster OSM base with an OpenSeaMap seamark overlay as the nautical map
presentation for the club explorer. Keep the club markers and interactions in
the existing MapLibre client component.

The style includes:

- a neutral marine background color
- OpenStreetMap raster tiles for the base geography
- OpenSeaMap seamark tiles for nautical symbols and chart detail
- explicit attribution for both data sources

## Consequences

- The map reads more like a nautical chart without introducing a new tile
  pipeline.
- The implementation stays client-side and compatible with the current
  MapLibre setup.
- If seamark tiles are unavailable, the app still falls back to the OSM base
  map.
- The current approach is an interim nautical basemap, not a full ENC-style
  chart renderer.
