import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

let tempRoot = ''
const originalCwd = process.cwd()

describe('GeoJsonClubRepository', () => {
  afterEach(async () => {
    process.chdir(originalCwd)

    if (tempRoot) {
      await rm(tempRoot, { recursive: true, force: true })
      tempRoot = ''
    }
  })

  it('reads clubs.geojson and maps feature properties to domain clubs', async () => {
    tempRoot = await mkdtemp(join(tmpdir(), 'reciprocal-clubs-'))
    const dataDir = join(tempRoot, 'data')
    const geojsonPath = join(dataDir, 'clubs.geojson')

    await mkdir(dataDir, { recursive: true })
    await writeFile(
      geojsonPath,
      JSON.stringify({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              name: 'Sample Yacht Club',
              region: 'Puget Sound North',
              distance_nm: 42,
              website: 'https://example.com',
              address: '123 Harbor Way',
              phone: '+1 555-000-0000',
            },
            geometry: {
              type: 'Point',
              coordinates: [-122.5, 47.6],
            },
          },
        ],
      }),
      'utf8',
    )

    process.chdir(tempRoot)

    const { GeoJsonClubRepository } = await import('./geojson-club-repository')
    const repository = new GeoJsonClubRepository()
    const clubs = await repository.getAllClubs()

    expect(clubs).toEqual([
      {
        name: 'Sample Yacht Club',
        region: 'Puget Sound North',
        distanceNm: 42,
        website: 'https://example.com',
        address: '123 Harbor Way',
        phone: '+1 555-000-0000',
        longitude: -122.5,
        latitude: 47.6,
      },
    ])
  })
})
