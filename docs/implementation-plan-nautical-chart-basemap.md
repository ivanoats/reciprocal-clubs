# Nautical Chart Basemap Implementation Plan

## Goal

Add a nautical-chart basemap to the reciprocal clubs map so the club markers
sit on a chart-style foundation instead of a generic street map. The basemap
should support marine-oriented cartography, preserve readability of club
markers, and fit the existing Next.js 19, Panda CSS, and MapLibre
architecture.

## Reference approach from Seamap

The Seamap project is useful as a reference because it treats nautical mapping
as a layered cartographic system instead of a single opaque background. The
parts worth adapting here are:

- A dedicated nautical basemap with marine styling rather than a generic
  city-first map.
- Clear layer separation between land, water, bathymetry, and maritime
  symbols.
- Chart-first visual hierarchy with low-zoom context, then progressively
  richer nautical detail.
- Optional bathymetry and contour data where available, rendered as chart
  context rather than decoration.
- Strong source attribution and explicit data provenance for every chart
  layer.

The important difference for this repo is scope: we do not need to reproduce
Seamap’s full nautical chart generation pipeline. We only need the parts that
improve the club directory experience as a basemap.

## Product decision

Use a nautical chart basemap as an optional, first-class map style in the app.
Keep the club dataset, filters, and details unchanged, and swap only the
visual base layer under the existing MapLibre overlay.

Recommended direction:

- Start with a hosted chart tile source or PMTiles-backed basemap so we can
  ship quickly.
- Preserve a fallback basemap for users or environments where chart tiles are
  unavailable.
- Keep club markers, popups, and filters above the chart style with high
  contrast and simple symbol rules.
- Treat bathymetry and marine detail as enhancement layers, not requirements
  for launch.

## Scope

In scope:

- A nautical-chart basemap option in the map UI.
- MapLibre style integration for chart tiles or PMTiles.
- Layer ordering so club markers remain legible over complex chart
  backgrounds.
- Attribution, loading states, and graceful fallback behavior.
- A small set of implementation notes or ADRs if a new basemap source or
  rendering strategy is introduced.

Out of scope for the first pass:

- Building a full Seamap-style tile generation pipeline.
- Generating our own bathymetry, contour, or seamark tiles.
- Importing the full maritime symbol catalog.
- Reworking the club dataset or domain model.

## Implementation phases

### Phase 1 — Source selection and technical decision

Evaluate the chart basemap source and choose one of these paths:

1. Hosted nautical chart tiles from an external provider.
2. Self-hosted PMTiles or vector tiles if we need offline control.
3. A hybrid setup with chart tiles for default viewing and a conventional
   basemap fallback.

Decision criteria:

- Tile availability and licensing.
- Visual quality at the zoom levels used by the club map.
- Whether attribution requirements are compatible with the app layout.
- Performance on desktop and mobile.
- Ease of local development and preview deploys.

Exit criteria:

- One basemap source is selected and documented.
- The fallback path is known.
- The attribution model is clear.

### Phase 2 — MapLibre style integration

Add the nautical chart basemap as a dedicated style or base layer
configuration in the MapLibre adapter.

Implementation points:

- Keep the map component client-only.
- Load the chart basemap in the same place the current map style is
  assembled.
- Ensure club markers, selected states, and popups render above chart detail.
- Use low-opacity or neutral styling for overlays if the chart background is
  visually dense.
- Avoid pulling map-specific styling into domain or application layers.

Exit criteria:

- The map can render with the nautical chart basemap in local development.
- Club markers remain readable at the primary zoom ranges.
- The fallback style still works.

### Phase 3 — Cartographic polish

Adjust the visual hierarchy so the chart enhances navigation without fighting
the club data.

Borrowed ideas from Seamap to adapt here:

- Keep base cartography subtle and marine-oriented.
- Use stronger contrast for interactive overlays than for background detail.
- Prefer a stable layer order instead of ad hoc style tweaks.
- Add attribution and source credits in a predictable location.

Likely UI work:

- Tune marker colors, borders, and shadows for chart backgrounds.
- Add hover and selection states that survive busy coastal detail.
- Review cluster styles if nearby clubs overlap on dense chart regions.

Exit criteria:

- The chart layer does not reduce marker legibility.
- Dense coastal areas remain usable.
- Attribution is visible and correct.

### Phase 4 — Resilience and fallback

Add operational safeguards so the basemap choice does not block the app.

Planned safeguards:

- Show a fallback basemap if nautical chart tiles fail to load.
- Surface a non-blocking message if the chart source is unavailable.
- Keep map interaction available even when the chart source is offline.
- Avoid hard dependencies on external bathymetry or seamark services for
  core browsing.

Exit criteria:

- Basemap failure does not break the directory experience.
- The app remains usable in weak-network environments.

### Phase 5 — Documentation and decision capture

Record the basemap choice in an ADR if the implementation depends on a new
provider, tile format, or caching strategy.

Document:

- Why the chart basemap was chosen.
- Which source or tile format was selected.
- Any license or attribution constraints.
- The fallback strategy.
- Any future path toward self-hosted nautical tiles.

Exit criteria:

- The decision is traceable in `docs/adr/`.
- The implementation notes are sufficient for future maintenance.

## Suggested delivery order

1. Choose the chart basemap source and fallback strategy.
2. Wire the chart basemap into the MapLibre adapter.
3. Adjust overlay styling and attribution.
4. Verify mobile and desktop behavior in coastal and inland views.
5. Record the decision in an ADR if the source or format is new.

## Risks

- Licensing or attribution constraints could make a chart source unsuitable
  for production.
- High-detail chart backgrounds can overwhelm markers if the overlay
  hierarchy is too weak.
- External tile availability may be unreliable without a fallback.
- A self-hosted tile pipeline can expand scope quickly if we decide to match
  Seamap’s depth and seamark features.

## Open questions

- Do we want a hosted chart source first, or do we want to own the tile
  pipeline from day one?
- Should the nautical basemap be the default view, or an opt-in style toggle?
- Do we want future support for bathymetry and contour overlays, or just a
  cleaner chart background?
