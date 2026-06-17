# 0004. Use MapLibre GL JS for Mapping

**Date:** 2026-06-16  
**Status:** Accepted

## Context

The app needs an interactive, embeddable map with marker support for club
coordinates sourced from GeoJSON.

## Decision

Use MapLibre GL JS in client components only. Keep map rendering logic in UI
components and pass normalized club data from application/adapters.

## Consequences

- Supports rich interaction for map browsing
- Requires explicit client boundary and map CSS import
- Coordinate handling must preserve GeoJSON order: `[longitude, latitude]`
