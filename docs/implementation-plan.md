# Phased implementation plan

## Goal

Build a Next.js 19 application on top of the reciprocal-clubs dataset
with Panda CSS, Ark UI, and MapLibre, while preserving
`data/clubs.geojson` as the authoritative source and aligning with
Netlify deployment, hexagonal architecture, ADRs, CI/CD, code quality
gates, and semantic-release.

## Phase 1 — Foundation and bootstrap

- Scaffold the Next.js 19 app with App Router, TypeScript, and
  ESM-oriented app code.
- Add and configure Panda CSS, Ark UI, MapLibre, Vitest, ESLint, and
  the Netlify-compatible Next.js setup.
- Define package scripts for dev, build, lint, test, coverage, and
  targeted test runs.
- Keep existing data scripts (`validate.js`, `geojson-to-kml.js`)
  isolated as legacy CommonJS utilities.
- Create baseline config files: `next.config.ts`, `tsconfig.json`,
  Panda config, Vitest config, ESLint config, and Netlify-relevant
  settings.

### Phase 1 exit criteria

- App boots locally.
- Existing data assets remain unchanged and readable by the app.
- Core toolchain installs cleanly and commands are documented.

## Phase 2 — Hexagonal architecture and decisions

- Create the initial folder structure:
  - `src/domain`
  - `src/application`
  - `src/adapters`
  - `src/ui`
- Model the core domain concepts around clubs, regions, and filters.
- Define application ports for reading club data and exposing
  search/filter use cases.
- Implement adapters that load and normalize `data/clubs.geojson`.
- Add initial ADRs in `docs/adr/` for:
  - hexagonal architecture
  - Next.js 19
  - Panda CSS + Ark UI
  - MapLibre
  - Netlify deployment

### Phase 2 exit criteria

- Domain logic is framework-independent.
- Data loading flows through application ports and adapters instead of
  direct UI imports.
- Initial ADR set exists and captures the major decisions already made.

## Phase 3 — Core product experience

- Build the primary routes for the club directory and interactive map.
- Add a map adapter/component using MapLibre in a client boundary only.
- Load `data/clubs.geojson` as the map source and render club markers
  with correct `[longitude, latitude]` handling.
- Implement browse and discovery features:
  - region filtering
  - text search
  - club summary cards
  - club detail presentation
- Build shared UI with Ark primitives styled through Panda recipes and
  patterns.
- Implement light/dark theming from system `prefers-color-scheme` using
  semantic tokens only.

### Phase 3 exit criteria

- Users can browse clubs in both map and list forms.
- Map and list stay consistent against the same filtered dataset.
- No Tailwind or inline styling patterns leak into the app.

## Phase 4 — Testing and quality gates

- Add co-located unit tests for domain and application logic.
- Add component and adapter tests where behavior is non-trivial.
- Configure Vitest coverage reporting in lcov format for SonarQube.
- Enforce the 80% coverage target across statements, branches,
  functions, and lines.
- Add markdownlint for all Markdown and ESLint for app code.
- Add DeepSource and SonarQube configuration aligned with GitHub
  Actions.

### Phase 4 exit criteria

- Single-file and full-suite test commands work.
- Coverage reports are generated in CI-ready format.
- Quality tooling is configured without suppressing issues by default.

## Phase 5 — CI/CD, release automation, and deployment

- Add GitHub Actions workflows for lint, test, build, and deploy.
- Configure Netlify preview deploys for pull requests and production
  deploys from `main`.
- Configure semantic-release for automated versioning, changelog
  generation, and GitHub Releases.
- Align PR flow with conventional branching, Conventional Commits, and
  squash merges.
- Verify environment variable handling between local `.env.local` and
  Netlify-managed production settings.

### Phase 5 exit criteria

- Every PR can run through the full pipeline.
- Merge to `main` can produce a releasable deployment.
- Release notes and `CHANGELOG.md` are automated.

## Recommended execution order

1. Bootstrap the app and toolchain.
2. Lock in architecture boundaries and ADRs before building
   feature-heavy UI.
3. Deliver the directory + map vertical slice early.
4. Raise coverage and quality gates before automating deployment.
5. Finish with CI/CD and release automation once app behavior is
   stable.

## Early vertical slice

To reduce integration risk, the first usable slice should be:

- read GeoJSON through an adapter
- expose clubs through an application use case
- render a server-driven page shell
- mount a client-only MapLibre component
- show one synchronized list + map experience with region filters

## Key risks to manage

- Mixing app ESM code with legacy CommonJS scripts.
- Letting UI import data files directly instead of going through
  adapters.
- Pulling MapLibre into server components.
- Drifting from Panda tokens/recipes into ad hoc styling.
- Delaying ADRs until architectural choices are already entrenched.
