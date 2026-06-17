# PMTiles Worker (Cloudflare R2)

This Worker serves PMTiles archives from an R2 bucket with browser-safe CORS
and HTTP range support for MapLibre + PMTiles protocol requests.

## Files

- `src/index.js` — Worker entry point
- `wrangler.toml.example` — copy to `wrangler.toml` and fill in account values

## Deploy

1. Install Wrangler (if needed):

```sh
npm install -g wrangler
```

1. Copy and edit config:

```sh
cp cloudflare/pmtiles-worker/wrangler.toml.example cloudflare/pmtiles-worker/wrangler.toml
```

1. Authenticate:

```sh
wrangler login
```

1. Deploy:

```sh
cd cloudflare/pmtiles-worker
wrangler deploy
```

## Deploy with GitHub Actions (IaC)

The repository includes a deployment workflow in
`.github/workflows/deploy-pmtiles-worker.yml`.

Add these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Recommended token permissions:

- Workers Scripts: Edit
- Workers Routes: Edit
- Account Settings: Read
- R2 Storage: Edit (for bucket binding usage)

Trigger options:

- push to `main` when files under `cloudflare/pmtiles-worker/` change
- manual run via Actions `workflow_dispatch`

## Upload PMTiles to R2 with GitHub Actions

Use `.github/workflows/upload-pmtiles-r2.yml` (manual run) to upload a PMTiles
archive to R2 from a download URL.

Required repository secrets:

- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_ACCOUNT_ID`

Workflow inputs:

- `pmtiles_download_url` — public URL to the `.pmtiles` archive
- `object_key` — destination object key in R2
- `bucket_name` — R2 bucket name

## URL shape

- `https://<worker-subdomain>/<object-key>.pmtiles`
- Example: `https://styc-pmtiles.<subdomain>.workers.dev/ncds_20c.pmtiles`

## CORS origin patterns

Set `ALLOWED_ORIGINS` in `wrangler.toml` as a comma-separated list.

Supported values:

- exact origin: `https://styc-recip.netlify.app`
- wildcard suffix: `https://*.netlify.app`
- all origins (least restrictive): `*`

Example:

```toml
ALLOWED_ORIGINS = "http://localhost:3000,https://styc-recip.netlify.app,https://*.netlify.app"
```

## App wiring

Set these values in `.env.local`:

```sh
NEXT_PUBLIC_NAUTICAL_CHART_SOURCE_MODE=pmtiles
NEXT_PUBLIC_NAUTICAL_CHART_PMTILES_URL=https://<worker-subdomain>/ncds_20c.pmtiles
```

Restart your Next.js server after changing `.env.local`.
