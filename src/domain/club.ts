export type Club = {
  name: string
  region: string
  distanceNm: number
  website: string
  address: string
  phone: string
  longitude: number
  latitude: number
}

export type ClubFilters = {
  region?: string
  query?: string
}

export const normalizeText = (value: string): string => value.trim().toLowerCase()

export const clubMatchesFilters = (club: Club, filters: ClubFilters): boolean => {
  const regionFilter = normalizeText(filters.region ?? '')
  const queryFilter = normalizeText(filters.query ?? '')

  if (regionFilter && normalizeText(club.region) !== regionFilter) {
    return false
  }

  if (!queryFilter) {
    return true
  }

  const searchable = [club.name, club.region, club.address].map(normalizeText).join(' ')
  return searchable.includes(queryFilter)
}
