# 0001. Adopt Hexagonal Architecture

**Date:** 2026-06-16  
**Status:** Accepted

## Context

The application needs to evolve from a data-only repository into a map and
search experience while preserving long-term maintainability. We need clear
boundaries so domain logic is not coupled to Next.js or MapLibre.

## Decision

Adopt a hexagonal architecture with these top-level layers:

- `src/domain`: business entities and pure logic
- `src/application`: use cases and ports
- `src/adapters`: infrastructure implementations (GeoJSON loader, map wiring)
- `src/ui`: React UI components and composition

UI and framework-specific code must depend on application ports, while domain
logic remains framework-agnostic.

## Consequences

- Easier unit testing of domain and use-case behavior
- Clear seams for changing data sources and UI frameworks
- Slightly more upfront structure and indirection
