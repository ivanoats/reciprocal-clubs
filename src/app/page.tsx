import { GetClubsUseCase } from '@/application/use-cases/get-clubs'
import { GeoJsonClubRepository } from '@/adapters/repositories/geojson-club-repository'
import { ClubExplorerIsland } from '@/ui/components/club-explorer-island'
import { ClubFilters } from '@/ui/components/club-filters'
import { css } from '../../styled-system/css'

type HomePageProps = {
  searchParams: Promise<{ q?: string; region?: string; club?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const useCase = new GetClubsUseCase(new GeoJsonClubRepository())
  const clubs = await useCase.execute({
    query: params.q,
    region: params.region,
  })

  const allClubs = await useCase.execute()
  const regions = Array.from(new Set(allClubs.map((club) => club.region))).sort()
  const selectedClubName = clubs.find((club) => club.name === params.club)?.name

  return (
    <main
      className={css({
        minH: '100vh',
        bg: 'bgCanvas',
        color: 'textPrimary',
        p: { base: '4', md: '8' },
      })}
    >
      <section className={css({ maxW: '7xl', mx: 'auto', display: 'grid', gap: '6' })}>
        <header>
          <p className={css({ fontFamily: 'heading', fontSize: { base: '2xl', md: '4xl' }, fontWeight: '700' })}>
            STYC Reciprocal Clubs
          </p>
          <p className={css({ color: 'textMuted' })}>{clubs.length} clubs match current filters.</p>
        </header>

        <ClubFilters query={params.q} regions={regions} selectedRegion={params.region} />

        <ClubExplorerIsland clubs={clubs} initialSelectedClubName={selectedClubName} />
      </section>
    </main>
  )
}
