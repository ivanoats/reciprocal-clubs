## [1.0.4](https://github.com/ivanoats/reciprocal-clubs/compare/v1.0.3...v1.0.4) (2026-06-26)

### Bug Fixes

* **theme:** replace hardcoded slate colors with semantic tokens to fix dark mode hover flash ([#27](https://github.com/ivanoats/reciprocal-clubs/issues/27)) ([b385fd3](https://github.com/ivanoats/reciprocal-clubs/commit/b385fd3132cb719df3f80e30ea233e359489d817))
* **validate:** resolve clubs.geojson path relative to __dirname ([#24](https://github.com/ivanoats/reciprocal-clubs/issues/24)) ([9edc4b9](https://github.com/ivanoats/reciprocal-clubs/commit/9edc4b9ef14380172033e3c6948c4145d5388fc9))

## [1.0.3](https://github.com/ivanoats/reciprocal-clubs/compare/v1.0.2...v1.0.3) (2026-06-26)

### Bug Fixes

* **filters:** auto-submit form on region select change ([#26](https://github.com/ivanoats/reciprocal-clubs/issues/26)) ([7e167c2](https://github.com/ivanoats/reciprocal-clubs/commit/7e167c275d7d79f36d6ee3e8543aa85cae2ec198))

## [1.0.2](https://github.com/ivanoats/reciprocal-clubs/compare/v1.0.1...v1.0.2) (2026-06-26)

### Bug Fixes

* **repository:** eliminate process.chdir test pollution via dataDir dependency injection ([#28](https://github.com/ivanoats/reciprocal-clubs/issues/28)) ([1572a58](https://github.com/ivanoats/reciprocal-clubs/commit/1572a5836df616710bf92b111c6939a630f2d24f))

## [1.0.1](https://github.com/ivanoats/reciprocal-clubs/compare/v1.0.0...v1.0.1) (2026-06-22)

### Bug Fixes

* **map:** remove zoom-detail badge from chart mode ([#12](https://github.com/ivanoats/reciprocal-clubs/issues/12)) ([b148ab6](https://github.com/ivanoats/reciprocal-clubs/commit/b148ab62b1dd8528b14924c8565e0f634018ea5e))

## 1.0.0 (2026-06-22)

### Features

* **app:** bootstrap Next.js stack and synchronized map explorer ([5abdbd4](https://github.com/ivanoats/reciprocal-clubs/commit/5abdbd432534a07c948762e596fcd57fd25a9531))
* initial data ([68566c1](https://github.com/ivanoats/reciprocal-clubs/commit/68566c10f1e2b0ec2d62c49d5b60f581113cf0de))
* **map:** add basemap style toggle ([a1692a9](https://github.com/ivanoats/reciprocal-clubs/commit/a1692a98c376af5e34a35a4d07731113e2cb6568))
* **map:** add nautical basemap overlay ([3027d90](https://github.com/ivanoats/reciprocal-clubs/commit/3027d90c84884e04251d32ff15fbabcd57ac7da6))
* **map:** add OpenSeaMap nautical overlay as third baselayer option ([#9](https://github.com/ivanoats/reciprocal-clubs/issues/9)) ([0d4a49e](https://github.com/ivanoats/reciprocal-clubs/commit/0d4a49e78f3a07a6fe1ee894b53a9d8719db083b)), closes [#8](https://github.com/ivanoats/reciprocal-clubs/issues/8)
* **map:** add PMTiles chart source mode and local tooling ([30a4ab6](https://github.com/ivanoats/reciprocal-clubs/commit/30a4ab64691ac0092df76d57751a5f0fe5a84c73))
* **map:** support mbtiles-backed noaa chart tiles ([f565d36](https://github.com/ivanoats/reciprocal-clubs/commit/f565d3615a094fbf80d5b8c094cc1272e7cd2c24))
* support multiple PMTiles sources for overlapping NOAA chart regions ([e85a63b](https://github.com/ivanoats/reciprocal-clubs/commit/e85a63b1d1ace1a4f3cbcc7944d6e97237606203))
* upload pmtiles ([a08dff4](https://github.com/ivanoats/reciprocal-clubs/commit/a08dff4af1e767feb4441f0e3c3d23aaf749b92b))
* zoom to club ([6a1513d](https://github.com/ivanoats/reciprocal-clubs/commit/6a1513d0c30ff09988863122d537508e52c8c722))

### Bug Fixes

* add analyzers to .deepsource.toml ([0f662fa](https://github.com/ivanoats/reciprocal-clubs/commit/0f662fa2ed85ca5dba42419c8fc0526b39d81a49))
* address copilot review comments on nautical chart scripts and docs ([f8d13b0](https://github.com/ivanoats/reciprocal-clubs/commit/f8d13b0338e230d051827ea2529c2c3f292b55e6))
* call track() instead of setZoom() directly in effect body ([2624ef2](https://github.com/ivanoats/reciprocal-clubs/commit/2624ef25ad376fe69ac8fa058db4bfa72094892a))
* charts ([8658cdc](https://github.com/ivanoats/reciprocal-clubs/commit/8658cdc9f9683de209a4d0d7d1b63a844bda561a))
* ci ([d271bc5](https://github.com/ivanoats/reciprocal-clubs/commit/d271bc5ec11e1df7c2261021a39170234c70f843))
* **ci:** add vitest coverage provider and R2 upload helper ([205017e](https://github.com/ivanoats/reciprocal-clubs/commit/205017ec60358e91aa13eecf25e9334f5bd56753))
* deepsource ([e1c87b9](https://github.com/ivanoats/reciprocal-clubs/commit/e1c87b9edf13bc853349f476108277ddfac85b03))
* **deps:** add explicit vite devDependency ([14dfa5d](https://github.com/ivanoats/reciprocal-clubs/commit/14dfa5d18905f1e001de7be7fcde71ce0f53c240))
* **docs:** fix markdown lint errors in COMPARISON_KML_vs_EXTRACTED.md ([bc76a6a](https://github.com/ivanoats/reciprocal-clubs/commit/bc76a6aeaf9febf79c3d77525bebdf4d3bb71a0e))
* **docs:** wrap long line in README.md to fix MD013 lint error ([a6b8c8b](https://github.com/ivanoats/reciprocal-clubs/commit/a6b8c8b112c979f099b6a1e0759dc8eb93330704))
* fitBounds immediately if style already loaded, unregister on cleanup ([41aa111](https://github.com/ivanoats/reciprocal-clubs/commit/41aa11175061511672471f7e968ff8f51428b5d4))
* local dev ([0de73a4](https://github.com/ivanoats/reciprocal-clubs/commit/0de73a4b225a8298f1e74559e32eba2561f4296b))
* local files ([8f9e6c7](https://github.com/ivanoats/reciprocal-clubs/commit/8f9e6c7b46416457e31b2ed4f510f261545bdfc0))
* map ([8b8f9fe](https://github.com/ivanoats/reciprocal-clubs/commit/8b8f9fea50d34f0f3709bac11fc683ef67dbfc10))
* map load err ([3bc00a7](https://github.com/ivanoats/reciprocal-clubs/commit/3bc00a7c4c090c3bc23cea8a777d27956f7945d0))
* map load err again ([f66dbc5](https://github.com/ivanoats/reciprocal-clubs/commit/f66dbc5734b8cabd07918647c47388a9211bc406))
* **map:** fallback broken custom chart xyz to default NOAA ([bd34ab4](https://github.com/ivanoats/reciprocal-clubs/commit/bd34ab459f12c07927b603f2da922ee4f2380fd4))
* **map:** fallback to NOAA tiles when PMTiles chart source fails ([ed124a5](https://github.com/ivanoats/reciprocal-clubs/commit/ed124a5c1557ae3be38b3cd48cbfe467db28b185))
* **map:** fallback to seamarks when NOAA returns placeholder tiles ([ed87e4c](https://github.com/ivanoats/reciprocal-clubs/commit/ed87e4cf2f14d763cde5991740d8db3eeb8c1d82))
* **map:** force NOAA fallback when PMTiles chart source stalls ([e0af0b9](https://github.com/ivanoats/reciprocal-clubs/commit/e0af0b93f316df366cebb4186b5ea515d5048db6))
* **map:** layer NOAA over OSM in chart mode ([7f6cdc4](https://github.com/ivanoats/reciprocal-clubs/commit/7f6cdc43d60d088add8db31c40d815b5aa35085f))
* **map:** proxy NOAA tiles through Next.js route ([02be56e](https://github.com/ivanoats/reciprocal-clubs/commit/02be56e92da67b50de755c969e1287057d7ace53))
* **map:** resolve hydration mismatch with client-only explorer ([1afb5e3](https://github.com/ivanoats/reciprocal-clubs/commit/1afb5e38b83710aa75d621725a343d889387828f))
* **map:** restore nautical background under transparent NOAA tiles ([23eeb89](https://github.com/ivanoats/reciprocal-clubs/commit/23eeb89577a4ea0dcffe502b9a60c88f07011203))
* **map:** set PNW initial viewport and NOAA export source ([3cd782d](https://github.com/ivanoats/reciprocal-clubs/commit/3cd782d09ac4fef16434df9a5296305ee53d4d12))
* **map:** use noaa chart tiles for chart mode ([254c693](https://github.com/ivanoats/reciprocal-clubs/commit/254c693c285c15fb47deea291df2719ae0018a8c))
* merge ([eee3fbc](https://github.com/ivanoats/reciprocal-clubs/commit/eee3fbc6017fba322c8ffb8ce835cf6c880d01c7))
* move ref updates out of render to satisfy react-hooks/refs ([5e7407e](https://github.com/ivanoats/reciprocal-clubs/commit/5e7407e8a7ad626859fa814315bb1fddf1addb6b))
* partial zoom nautical chart fix ([48ec5af](https://github.com/ivanoats/reciprocal-clubs/commit/48ec5aff2fcd3f18456c95200f7ff4786e46d740))
* pmtiles ([0dadafa](https://github.com/ivanoats/reciprocal-clubs/commit/0dadafa42a6bec01166aa9464f56d2d78bf227c8))
* refactor ([1ea6681](https://github.com/ivanoats/reciprocal-clubs/commit/1ea66817d5a062d33fde2c63bcefce9ad9735911))
* refactor contd ([00d53f7](https://github.com/ivanoats/reciprocal-clubs/commit/00d53f7b1c9e2c771189af2208d60343698d7044))
* replace mapRef in hook deps with map state instance ([09149a8](https://github.com/ivanoats/reciprocal-clubs/commit/09149a816528d493bc59b60715d79844c95ce4b8))
* reset health state on map/mode change to avoid stale loaded status ([a97441f](https://github.com/ivanoats/reciprocal-clubs/commit/a97441f41f4a68c1aeca0a1bf0c01bf7eeaa851b))
* roche harbor ([88eab40](https://github.com/ivanoats/reciprocal-clubs/commit/88eab40d64648f02f623db0127001f9a7d0a1ee4))
* roche harbor ([18c24d4](https://github.com/ivanoats/reciprocal-clubs/commit/18c24d422e45d8209f4b678db22ccb52628d4619))
* suppress DeepSource JS-0045 on valid useEffect cleanup returns ([0af4719](https://github.com/ivanoats/reciprocal-clubs/commit/0af47194cb356cbbb056058d666bee1a07301e6e))
* zoom ([e65195b](https://github.com/ivanoats/reciprocal-clubs/commit/e65195b2594557e2b57461d084651cfd2d825b84))
* zoom label ([086cdf7](https://github.com/ivanoats/reciprocal-clubs/commit/086cdf78d444b4de7f43bf006c986cabc386bc39))
