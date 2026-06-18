# 0007. Cloudflare R2 + Worker for PMTiles Delivery

**Date:** 2026-06-17  
**Status:** Accepted

## Context

The application requires delivery of large PMTiles nautical chart archives to
browser clients with:

- HTTP range request support
- browser-safe CORS behavior for local development and production domains
- reliable hosting independent of app server runtime limits
- repeatable deployment and upload workflows (IaC)

Direct browser access to large archives from ad-hoc hosts proved fragile,
particularly for CORS/origin mismatches and operational consistency.

## Decision

Use Cloudflare R2 as object storage for PMTiles archives and a Cloudflare
Worker as the public delivery endpoint.

The Worker is responsible for:

- serving PMTiles objects from R2 by object key
- preserving range semantics (`206`, `content-range`, `accept-ranges`)
- handling CORS for configured origins, including wildcard Netlify previews

The map app uses the Worker URL via:

- `NEXT_PUBLIC_NAUTICAL_CHART_SOURCE_MODE=pmtiles`
- `NEXT_PUBLIC_NAUTICAL_CHART_PMTILES_URL=https://<worker>/<object>.pmtiles`

Use GitHub Actions workflows for infrastructure and data operations:

- `.github/workflows/deploy-pmtiles-worker.yml` to deploy Worker changes
- `.github/workflows/upload-pmtiles-r2.yml` to upload PMTiles archives to R2

Provide a local upload script (`scripts/upload-pmtiles-to-r2.sh`) for large
file uploads and developer workflows, with profile validation for Cloudflare R2
credentials.

## Consequences

- PMTiles delivery is decoupled from Next.js hosting and application runtime.
- Range and CORS behavior is centralized in a controlled edge endpoint.
- Local and preview environments are supported via explicit origin settings.
- CI/CD workflows can deploy Worker code and upload chart archives without
  manual dashboard steps.
- Requires Cloudflare account setup, R2 bucket management, Worker deployment
  permissions, and secure secret management in GitHub.
