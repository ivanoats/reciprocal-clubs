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
        backgroundImage: {
          base: 'radial-gradient(ellipse at top, {colors.slate.100}, {colors.slate.50})',
          _dark: 'radial-gradient(ellipse at top, {colors.slate.900}, {colors.slate.950})',
        },
        color: 'textPrimary',
        p: { base: '4', md: '8' },
      })}
    >
      <section className={css({ maxW: '7xl', mx: 'auto', display: 'grid', gap: '6' })}>
        <header
          className={css({
            display: 'flex',
            flexDirection: { base: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { base: 'flex-start', sm: 'center' },
            gap: '4',
            pb: '6',
            borderBottom: '1px solid',
            borderColor: 'borderSubtle',
          })}
        >
          <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                w: '12',
                h: '12',
                borderRadius: 'xl',
                bgGradient: 'to-br',
                gradientFrom: 'cyan.500',
                gradientTo: 'blue.600',
                color: 'white',
                boxShadow: '0 4px 14px 0 rgba(6, 182, 212, 0.35)',
              })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={css({ w: '7', h: '7' })}
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="12,3 14.5,9.5 21,12 14.5,14.5 12,21 9.5,14.5 3,12 9.5,9.5" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1
                className={css({
                  fontFamily: 'heading',
                  fontSize: { base: '2xl', md: '3xl' },
                  fontWeight: '800',
                  letterSpacing: 'tight',
                  bgGradient: 'to-r',
                  gradientFrom: 'textPrimary',
                  gradientTo: { base: 'cyan.600', _dark: 'cyan.400' },
                  bgClip: 'text',
                  color: 'transparent',
                })}
              >
                STYC Reciprocal Clubs
              </h1>
              <p className={css({ color: 'textMuted', fontSize: 'sm', mt: '0.5' })}>
                Explore reciprocal yacht clubs and yachting destinations
              </p>
            </div>
          </div>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              bg: 'bgSurface',
              px: '4',
              py: '1.5',
              borderRadius: 'full',
              borderWidth: '1px',
              borderColor: 'borderSubtle',
              boxShadow: 'sm',
            })}
          >
            <span
              className={css({
                w: '2.5',
                h: '2.5',
                borderRadius: 'full',
                bg: 'cyan.500',
                boxShadow: '0 0 8px 2px rgba(6, 182, 212, 0.4)',
              })}
            />
            <span
              className={css({
                fontSize: 'xs',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 'wider',
                color: 'textMuted',
              })}
            >
              {clubs.length} {clubs.length === 1 ? 'Club' : 'Clubs'} Found
            </span>
          </div>
        </header>

        <ClubFilters query={params.q} regions={regions} selectedRegion={params.region} />

        <ClubExplorerIsland clubs={clubs} initialSelectedClubName={selectedClubName} />
      </section>
    </main>
  )
}
