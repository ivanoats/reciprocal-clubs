# 0003. Use Panda CSS and Ark UI

**Date:** 2026-06-16  
**Status:** Accepted

## Context

The project requires token-driven styling, no Tailwind usage, and accessible UI
primitives that can be themed consistently.

## Decision

Use Panda CSS for styling (`css`, recipes, semantic tokens) and Ark UI for
headless accessible components.

## Consequences

- Compile-time CSS extraction and token consistency
- Better long-term theming structure
- Requires codegen and cssgen in development workflow
