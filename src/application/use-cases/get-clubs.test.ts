import { describe, expect, it } from 'vitest'

import type { Club } from '@/domain/club'

import { GetClubsUseCase } from './get-clubs'

const clubs: Club[] = [
  {
    name: 'Club A',
    region: 'Puget Sound South',
    distanceNm: 30,
    website: 'https://example.com/a',
    address: 'A street',
    phone: '+1 555-111-1111',
    longitude: -122.3,
    latitude: 47.2,
  },
  {
    name: 'Club B',
    region: 'Vancouver Area',
    distanceNm: 10,
    website: 'https://example.com/b',
    address: 'B street',
    phone: '+1 555-222-2222',
    longitude: -123.1,
    latitude: 49.2,
  },
]

describe('GetClubsUseCase', () => {
  it('filters and sorts clubs', async () => {
    const repository = {
      getAllClubs: async () => clubs,
    }

    const useCase = new GetClubsUseCase(repository)
    const result = await useCase.execute({ query: 'club' })

    expect(result.map((club) => club.name)).toEqual(['Club B', 'Club A'])
  })
})
