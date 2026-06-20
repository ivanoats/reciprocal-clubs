# Architecture

This document describes the structure of the Reciprocal Clubs application using
the [C4 model](https://c4model.com). All diagrams use MermaidJS.

---

## Level 1 — System context

The Reciprocal Clubs system lets sailors browse and filter STYC's 68 reciprocal
yacht clubs on an interactive map. It consists of a Next.js web app served from
Netlify and nautical chart tiles served from a Cloudflare Worker backed by R2.

```mermaid
C4Context
  title System Context — Reciprocal Clubs

  Person(sailor, "Sailor", "STYC member planning a cruise")

  System(app, "Reciprocal Clubs Web App", "Next.js 16 app. Browse clubs, filter by region, view on map with NOAA nautical chart overlay.")

  System_Ext(netlify, "Netlify", "Hosts and deploys the Next.js app")
  System_Ext(cfWorker, "Cloudflare Worker + R2", "Serves PMTiles nautical chart archives with CORS and range request support")
  System_Ext(noaa, "NOAA Chart Distribution", "Source for MBTiles chart downloads (manual)")

  Rel(sailor, app, "Opens in browser")
  Rel(app, cfWorker, "Fetches PMTiles chart archive", "HTTPS range requests")
  Rel(app, netlify, "Deployed via GitHub Actions / Netlify CI")
  Rel(noaa, cfWorker, "Admin uploads MBTiles → PMTiles to R2", "manual / GitHub Actions")
```

---

## Level 2 — Container view

The system has two runtimes: the Next.js app (on Netlify) and the Cloudflare
Worker. Data lives in the repository as static files; there is no runtime database.

```mermaid
C4Container
  title Container View — Reciprocal Clubs

  Person(sailor, "Sailor")

  Container(nextApp, "Next.js App", "Next.js 16 / React 19", "Server-renders the home page with filtered club list. Serves the client-side map explorer.")
  Container(worker, "PMTiles Worker", "Cloudflare Worker (JS)", "Serves PMTiles archive from R2 with CORS headers and HTTP range-request support.")

  ContainerDb(geojson, "clubs.geojson", "Static GeoJSON file", "Authoritative dataset — 68 clubs with coordinates, region, distance, contact details.")
  ContainerDb(r2, "Cloudflare R2", "Object storage", "Stores NOAA PMTiles chart archives (e.g. ncds_20c.pmtiles).")

  Rel(sailor, nextApp, "HTTPS", "Netlify edge")
  Rel(nextApp, geojson, "reads at build / request time", "fs/promises (server only)")
  Rel(nextApp, worker, "MapLibre fetches chart tiles", "HTTPS range requests from browser")
  Rel(worker, r2, "reads", "R2 binding")
```

---

## Level 3 — Component view (Next.js app)

The app follows **Hexagonal Architecture** (Ports & Adapters). Dependencies always
point inward toward the domain; no outer layer imports an inner layer's concrete
types directly.

```mermaid
C4Component
  title Component View — Next.js App

  Container_Boundary(nextApp, "Next.js App") {

    Component(page, "HomePage (RSC)", "src/app/page.tsx", "Server Component. Reads search params, runs use case, renders ClubFilters and ClubExplorerIsland.")

    Component(filters, "ClubFilters", "src/ui/components/club-filters.tsx", "Server Component form — search input and region dropdown. Submits via GET query params.")

    Component(island, "ClubExplorerIsland", "src/ui/components/club-explorer-island.tsx", "Client boundary. Dynamic import (SSR disabled) wrapping ClubExplorer.")

    Component(explorer, "ClubExplorer", "src/ui/components/club-explorer.tsx", "Client Component. Owns selected-club state and URL sync. Composes ClubList, ClubDetails, MapView.")

    Component(map, "MapView", "src/ui/components/map-view.tsx", "Client Component. MapLibre GL instance. Renders club markers and optional PMTiles nautical chart layer.")

    Component(useCase, "GetClubsUseCase", "src/application/use-cases/get-clubs.ts", "Fetches all clubs, applies ClubFilters, sorts by distance_nm.")

    Component(port, "ClubRepository (port)", "src/application/ports/club-repository.ts", "Interface: getAllClubs(): Promise<Club[]>")

    Component(repo, "GeoJsonClubRepository", "src/adapters/repositories/geojson-club-repository.ts", "Reads data/clubs.geojson via fs/promises. Maps GeoJSON features to Club domain objects.")

    Component(domain, "Club domain", "src/domain/club.ts", "Club type, ClubFilters type, clubMatchesFilters(), normalizeText(). No framework dependencies.")
  }

  Rel(page, useCase, "instantiates and calls execute(filters)")
  Rel(page, filters, "renders")
  Rel(page, island, "renders with filtered clubs")
  Rel(island, explorer, "lazy loads")
  Rel(explorer, map, "renders")
  Rel(useCase, port, "depends on interface")
  Rel(repo, port, "implements")
  Rel(useCase, domain, "imports clubMatchesFilters")
  Rel(repo, domain, "maps features to Club")
  Rel(page, repo, "instantiates")
```

---

## Data flow — page load

```mermaid
sequenceDiagram
  actor Sailor
  participant Browser
  participant Netlify as Netlify Edge
  participant RSC as HomePage (RSC)
  participant UC as GetClubsUseCase
  participant Repo as GeoJsonClubRepository
  participant FS as clubs.geojson
  participant CF as Cloudflare Worker

  Sailor->>Browser: opens https://styc-recip.netlify.app?region=Seattle+Area
  Browser->>Netlify: GET /?region=Seattle+Area
  Netlify->>RSC: render with searchParams
  RSC->>UC: execute({ region: "Seattle Area" })
  UC->>Repo: getAllClubs()
  Repo->>FS: fs.readFile(data/clubs.geojson)
  FS-->>Repo: raw GeoJSON
  Repo-->>UC: Club[]
  UC-->>RSC: filtered + sorted Club[]
  RSC-->>Browser: HTML (club list + island placeholder)
  Browser->>Browser: hydrate ClubExplorerIsland
  Browser->>CF: MapLibre range requests for PMTiles
  CF-->>Browser: chart tile bytes
```

---

## Data pipeline — club data

```mermaid
flowchart LR
  GJ[data/clubs.geojson\nauthor. source] -->|geojson-to-kml.cjs| KML[data/clubs.kml]
  GJ -->|validate.cjs| VAL{valid?}
  VAL -- yes --> OK[CI passes]
  VAL -- no --> FAIL[CI fails]
  GJ -->|derived| JSON[data/clubs.json]
  GJ -->|derived| CSV[data/clubs.csv]
```

---

## Deployment pipeline

```mermaid
flowchart TD
  Push[git push to main] --> GHA[GitHub Actions CI]
  GHA -->|lint + test + build| Netlify[Netlify deploy]

  Manual[Manual trigger] --> WPFLOW[deploy-pmtiles-worker.yml]
  WPFLOW -->|wrangler deploy| CFW[Cloudflare Worker]

  Manual2[Manual trigger] --> R2FLOW[upload-pmtiles-r2.yml]
  R2FLOW -->|aws s3 cp| R2[Cloudflare R2 bucket]
```

---

## Clean Architecture layer mapping

| Layer | Directory | Rule |
| --- | --- | --- |
| Entities | `src/domain/` | Pure TypeScript — no framework imports |
| Use Cases | `src/application/use-cases/` | Depends only on domain and ports |
| Interface Adapters | `src/adapters/`, `src/app/` | Implements ports; may import Next.js |
| Frameworks & Drivers | `src/ui/`, `styled-system/` | React, MapLibre, Panda CSS |

---

## Architecture decisions

See [`docs/adr/`](adr/) for all recorded decisions:

| ADR | Decision |
| --- | --- |
| [0001](adr/0001-hexagonal-architecture.md) | Hexagonal Architecture |
| [0002](adr/0002-nextjs-app-router.md) | Next.js App Router |
| [0003](adr/0003-panda-css-and-ark-ui.md) | Panda CSS + Ark UI |
| [0004](adr/0004-maplibre-for-interactive-map.md) | MapLibre GL JS |
| [0005](adr/0005-netlify-deployment-target.md) | Netlify hosting |
| [0006](adr/0006-nautical-chart-basemap.md) | NOAA nautical chart basemap |
| [0007](adr/0007-cloudflare-r2-worker-for-pmtiles-delivery.md) | Cloudflare R2 + Worker for PMTiles |
