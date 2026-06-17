import 'server-only'

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { Club } from '@/domain/club'

import type { ClubRepository } from '@/application/ports/club-repository'

type GeoJsonFeature = {
  type: 'Feature'
  properties: {
    name: string
    region: string
    distance_nm: number
    website: string
    address: string
    phone: string
  }
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}

type GeoJsonCollection = {
  type: 'FeatureCollection'
  features: GeoJsonFeature[]
}

const toClub = (feature: GeoJsonFeature): Club => {
  const [longitude, latitude] = feature.geometry.coordinates

  return {
    name: feature.properties.name,
    region: feature.properties.region,
    distanceNm: feature.properties.distance_nm,
    website: feature.properties.website,
    address: feature.properties.address,
    phone: feature.properties.phone,
    longitude,
    latitude,
  }
}

export class GeoJsonClubRepository implements ClubRepository {
  async getAllClubs(): Promise<Club[]> {
    const filePath = join(process.cwd(), 'data', 'clubs.geojson')
    const raw = await readFile(filePath, 'utf8')
    const data = JSON.parse(raw) as GeoJsonCollection

    return data.features.map(toClub)
  }
}
