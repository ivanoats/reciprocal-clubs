import { css } from '../../../styled-system/css'

type ClubFiltersProps = {
  selectedRegion?: string
  query?: string
  regions: string[]
}

export const ClubFilters = ({ selectedRegion, query, regions }: ClubFiltersProps) => {
  return (
    <form
      className={css({
        display: 'grid',
        gap: '3',
        gridTemplateColumns: { base: '1fr', md: '1fr 240px' },
      })}
      action="/"
      method="get"
    >
      <input
        className={css({
          borderWidth: '1px',
          borderColor: 'slate.300',
          borderRadius: 'md',
          bg: 'bgSurface',
          px: '3',
          py: '2',
        })}
        defaultValue={query}
        name="q"
        placeholder="Search by club, region, or address"
        type="search"
      />
      <select
        className={css({
          borderWidth: '1px',
          borderColor: 'slate.300',
          borderRadius: 'md',
          bg: 'bgSurface',
          px: '3',
          py: '2',
        })}
        defaultValue={selectedRegion ?? ''}
        name="region"
      >
        <option value="">All regions</option>
        {regions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
    </form>
  )
}
