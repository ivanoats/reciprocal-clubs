# 0002. Use Next.js App Router

**Date:** 2026-06-16  
**Status:** Accepted

## Context

The web app needs server-rendered routing, modern React Server Components,
and a deployment model suitable for Netlify.

## Decision

Use Next.js App Router with TypeScript and Node.js runtime by default.
Follow Next.js async request APIs (`searchParams`, `params`) and keep client
libraries behind explicit client boundaries.

## Consequences

- Strong default performance and rendering model
- Clear Server/Client component separation requirements
- Requires awareness of Next.js conventions and version-specific behaviors
