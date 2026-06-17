# 0005. Target Netlify for Deployment

**Date:** 2026-06-16  
**Status:** Accepted

## Context

Project delivery requires preview and production deployment with GitHub-based
workflow and straightforward operational overhead.

## Decision

Target Netlify as the deployment platform for the Next.js application.
Maintain environment variables in Netlify UI for production and `.env.local`
for local development.

## Consequences

- Simple PR preview and production deployment workflow
- Need CI/CD integration and deploy credentials in GitHub/Netlify
- Runtime compatibility should be validated for Next.js updates
