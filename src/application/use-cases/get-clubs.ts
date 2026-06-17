import { clubMatchesFilters, type Club, type ClubFilters } from '@/domain/club'

import type { ClubRepository } from '../ports/club-repository'

export class GetClubsUseCase {
  constructor(private readonly clubRepository: ClubRepository) {}

  async execute(filters: ClubFilters = {}): Promise<Club[]> {
    const clubs = await this.clubRepository.getAllClubs()

    return clubs
      .filter((club) => clubMatchesFilters(club, filters))
      .sort((a, b) => a.distanceNm - b.distanceNm)
  }
}
