import type { Club } from '@/domain/club'

export interface ClubRepository {
  getAllClubs(): Promise<Club[]>
}
