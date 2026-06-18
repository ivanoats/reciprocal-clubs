# Reciprocal Clubs

[![Netlify Status](https://api.netlify.com/api/v1/badges/5e99940d-be1e-4d3a-b6dc-317c7a494c0c/deploy-status)](https://app.netlify.com/projects/styc-recip/deploys)

This repository serves two purposes:

1. It is the authoritative geodata source for **68 active reciprocal
   yacht clubs** for Sloop Tavern Yacht Club (STYC).
2. It is the home of a **Next.js 19 web app** that will provide an
   interactive club directory and map on top of that data.

The authoritative dataset is `data/clubs.geojson`. Other formats such as
KML, CSV, and JSON are derived exports.

## Current status

The repository now includes a working Next.js + TypeScript scaffold with
an initial vertical slice:

- hexagonal folder structure (`domain`, `application`, `adapters`, `ui`)
- GeoJSON adapter and application use case pipeline
- initial synchronized list + map route (`/`)
- Panda CSS toolchain and generated style artifacts
- Vitest baseline tests for domain and application behavior

## Data source of truth

`data/clubs.geojson` is the single source of truth for reciprocal club records.

```text
data/clubs.geojson  ->  geojson-to-kml.cjs  ->  data/clubs.kml
                    ->  manual export      ->  data/clubs.csv
                    ->  derived export     ->  data/clubs.json
```

Each feature includes:

- club name
- region
- distance from Seattle in nautical miles
- website
- address
- phone number
- point coordinates in GeoJSON order: `[longitude, latitude]`

## Current commands

Primary commands:

```sh
# Start the Next.js app
npm run dev

# Build a production bundle
npm run build

# Lint app code
npm run lint

# Run test suite
npm run test

# Run tests with coverage
npm run test:coverage

# Validate GeoJSON against the expected club list
npm run validate:data

# Regenerate KML from GeoJSON
npm run export:kml

# Lint all Markdown files
npx markdownlint-cli "**/*.md" --ignore node_modules
```

## Nautical chart source configuration

Chart mode is PMTiles-only.

- The map reads nautical chart tiles from a PMTiles archive URL.
- There is no runtime fallback to NOAA XYZ/OpenSeaMap in chart mode.
- If PMTiles cannot be loaded, chart mode remains blank (with status text) rather
  than switching to another basemap.

Start from the template and then adjust values as needed:

```sh
cp .env.example .env.local
```

Set these variables in `.env.local`:

```sh
# Keep as pmtiles for current chart behavior.
NEXT_PUBLIC_NAUTICAL_CHART_SOURCE_MODE=pmtiles

# Required for chart mode. Can be http(s) URL or full pmtiles:// URL.
# Example local:
# http://localhost:8081/ncds_20c.pmtiles
# Example Cloudflare Worker:
# https://styc-pmtiles.<subdomain>.workers.dev/ncds_20c.pmtiles
NEXT_PUBLIC_NAUTICAL_CHART_PMTILES_URL=

# Optional attribution override for chart source.
NEXT_PUBLIC_NAUTICAL_CHART_ATTRIBUTION=

# Optional glyph endpoint for MapLibre symbols.
# Default: https://fonts.openmaptiles.org/{fontstack}/{range}.pbf
NEXT_PUBLIC_MAPLIBRE_GLYPHS_URL=
```

### Using vokkim/noaa-nautical-charts regions 04-10

The repository lists MBTiles downloads from NOAA for regions 04 through 10,
which cover the needed U.S. areas.

1. Download `MBTILES_04.mbtiles` through `MBTILES_10.mbtiles`.
2. Place them in `data/nautical-charts/mbtiles/`.
3. Convert to PMTiles:

```sh
npm run nautical:pmtiles:convert
```

1. Merge into one archive (recommended):

```sh
npm run nautical:pmtiles:merge
```

1. Serve local PMTiles data:

```sh
npm run nautical:pmtiles:serve
```

### Converting a single MBTiles file (for example ncds_20c.mbtiles)

```sh
mkdir -p data/nautical-charts/pmtiles
pmtiles convert data/ncds_20c.mbtiles data/nautical-charts/pmtiles/ncds_20c.pmtiles
```

Then run the PMTiles server:

```sh
npm run nautical:pmtiles:serve
```

1. Point the app to the PMTiles archive URL:

```sh
NEXT_PUBLIC_NAUTICAL_CHART_SOURCE_MODE=pmtiles
NEXT_PUBLIC_NAUTICAL_CHART_PMTILES_URL=http://localhost:8081/ncds_20c.pmtiles
```

Notes:

- MapLibre in the browser cannot read `.mbtiles` files directly.
- Convert MBTiles to PMTiles first, then serve PMTiles over HTTP.
- `chart` mode uses PMTiles; `standard` mode remains OSM.
- There is no chart fallback layer in current behavior.

### Cloudflare R2 + Worker deployment (recommended for production PMTiles)

After uploading `ncds_20c.pmtiles` to your R2 bucket, deploy the included
Worker template to serve PMTiles with CORS + range requests.

1. Prepare Worker config:

```sh
cp cloudflare/pmtiles-worker/wrangler.toml.example cloudflare/pmtiles-worker/wrangler.toml
```

1. Edit `cloudflare/pmtiles-worker/wrangler.toml`:

- set `account_id`
- set `bucket_name` if not `styc`
- set `ALLOWED_ORIGINS` for local + production origins
  - include both `http://localhost:3000` and `http://localhost:3001`
  - wildcard domain patterns are supported, for example `https://*.netlify.app`

1. Deploy:

```sh
cd cloudflare/pmtiles-worker
wrangler login
wrangler deploy
```

1. Point app config to the deployed Worker URL:

```sh
NEXT_PUBLIC_NAUTICAL_CHART_SOURCE_MODE=pmtiles
NEXT_PUBLIC_NAUTICAL_CHART_PMTILES_URL=https://<worker-subdomain>/ncds_20c.pmtiles
```

See `cloudflare/pmtiles-worker/README.md` for details.

For infrastructure-as-code deployment, use the GitHub Actions workflow in
`.github/workflows/deploy-pmtiles-worker.yml` with repository secrets
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

To upload PMTiles archives to R2 without dashboard clicks, use
`.github/workflows/upload-pmtiles-r2.yml` (manual workflow dispatch).
Required repository secrets:

- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_ACCOUNT_ID`

Manual workflow inputs:

- `pmtiles_download_url` (public URL to the `.pmtiles` file)
- `object_key` (for example `ncds_20c.pmtiles`)
- `bucket_name` (for example `styc`)

For local uploads (also suitable for large files), use:

```sh
R2_BUCKET=styc R2_ACCOUNT_ID=<cloudflare-account-id> \
npm run nautical:pmtiles:upload:r2 -- \
  data/nautical-charts/pmtiles/ncds_20c.pmtiles ncds_20c.pmtiles
```

If `R2_AWS_PROFILE` is omitted, the script defaults to `r2`.
The script validates that the selected profile uses a 32-character R2 access
key ID to avoid accidental use of non-R2 AWS credentials.

### Netlify deployment and environment variables

There was not a dedicated Netlify env var checklist before; this section is the
source of truth for Netlify configuration.

1. Connect the repository to a Netlify site.
2. In Netlify, open Site configuration > Environment variables.
3. Add these app variables:

Required:

```sh
NEXT_PUBLIC_NAUTICAL_CHART_SOURCE_MODE=pmtiles
NEXT_PUBLIC_NAUTICAL_CHART_PMTILES_URL=https://<worker-subdomain>/ncds_20c.pmtiles
```

Optional:

```sh
NEXT_PUBLIC_NAUTICAL_CHART_ATTRIBUTION=
NEXT_PUBLIC_MAPLIBRE_GLYPHS_URL=
```

1. Trigger a redeploy after changing environment variables.

Notes:

- Use the Cloudflare Worker URL for `NEXT_PUBLIC_NAUTICAL_CHART_PMTILES_URL`.
- Netlify environment variables are separate from GitHub Actions secrets used
  for Cloudflare workflows.
- Local `.env.local` values do not automatically apply to Netlify.

## Available data files

| Format | File | Purpose |
| --- | --- | --- |
| GeoJSON | `data/clubs.geojson` | Authoritative mapping dataset |
| KML | `data/clubs.kml` | Google Earth and other KML consumers |
| JSON | `data/clubs.json` | Derived structured export |
| CSV | `data/clubs.csv` | Spreadsheet-friendly export |
| KML (original) | `data/STYC_Reciprocal_Clubs.kml` | Legacy source reference |
| CSV (original) | `data/STYC_Reciprocal_Clubs.csv` | Legacy source reference |

## Dataset conventions

- **Club count**: exactly 68 active reciprocal clubs in the curated dataset
- **Coordinates**: GeoJSON-standard `[longitude, latitude]`
- **Distance**: stored as `distance_nm`
- **Phone format**: E.164-style strings such as `+1 360-293-5277`
- **Regions**: use the existing 16 region names from the dataset; do
  not invent new names casually

### Regions in the curated dataset

- BC Islands
- Columbia River
- Columbia River OR
- Hawaii
- Inside Passage Alaska
- New Zealand
- Northern California
- Northern Inland Waters
- Olympic & Hood Canal
- Portland Area
- Puget Sound North
- Puget Sound South
- Seattle Area
- Southern California
- Vancouver Area
- Whidbey & Everett

## GeoJSON schema

```json
{
  "type": "Feature",
  "properties": {
    "name": "Anacortes Yacht Club",
    "region": "Northern Inland Waters",
    "distance_nm": 58,
    "website": "http://www.anacortesyachtclub.org",
    "address": "611 T Ave, Anacortes, WA 98221",
    "phone": "+1 360-293-5277"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-122.605, 48.5125]
  }
}
```

## Planned application stack

The app is built with:

- **Next.js 16** with the App Router and React Server Components
- **Panda CSS** for all styling
- **Ark UI** for accessible headless primitives
- **MapLibre GL JS** for interactive mapping
- **Netlify** for app hosting
- **Cloudflare R2 + Worker** for PMTiles chart delivery

Important implementation constraints:

- No Tailwind
- App code should use ESM `import`/`export`
- MapLibre stays in client components only
- Theme follows system `prefers-color-scheme`

## Architecture

The app follows a hexagonal architecture so domain logic stays
independent from Next.js and UI details.

```mermaid
graph TD
  UI --> Application
  Application --> Domain
  Adapters --> Application
```

Current structure:

```text
src/
  domain/
  application/
  adapters/
  ui/
```

- `domain/` contains pure business logic
- `application/` contains use cases and ports
- `adapters/` contains implementations for Next.js, data loading, map, and external services
- `ui/` contains thin React components

## Quality and delivery conventions

- Tests should target **80% coverage** across statements, branches,
  functions, and lines
- Markdown is linted with `markdownlint`
- CI/CD runs on **GitHub Actions**
- Code quality is enforced with **DeepSource** and **SonarQube**
- Pull requests follow **Conventional Commits** and **conventional
  branching**
- PRs are **squash-merged**
- Releases and changelog generation are handled by **semantic-release**

## Architectural decisions

Significant architectural and tooling decisions should be recorded as
ADRs in `docs/adr/` using numbered kebab-case filenames such as:

```text
docs/adr/0001-hexagonal-architecture.md
```

Use MermaidJS for architectural diagrams in ADRs and other project documentation.

## Data sources

Primary upstream references:

- [yachtdestinations.org](https://yachtdestinations.org)
- `data/STYC_Reciprocal_Clubs.kml`
- `data/clubpage.php?page=dt&club=63&account=72d331c5905e1bbe51588b9a2fba0487&css=default&hash=&title=yes&width=default&height=default`

## License

MIT for repository code and configuration. Source data remains subject
to the upstream website's terms of use.
