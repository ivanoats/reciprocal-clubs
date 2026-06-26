'use client'

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
        gap: '4',
        gridTemplateColumns: { base: '1fr', md: '1fr 260px' },
        bg: { base: 'rgba(241, 245, 249, 0.4)', _dark: 'rgba(15, 23, 42, 0.2)' },
        p: '3',
        borderRadius: '2xl',
        borderWidth: '1px',
        borderColor: 'borderSubtle',
        backdropFilter: 'blur(12px)',
        boxShadow: 'sm',
      })}
      action="/"
      method="get"
    >
      <div className={css({ position: 'relative', w: 'full' })}>
        <input
          className={css({
            w: 'full',
            borderWidth: '1px',
            borderColor: 'borderSubtle',
            borderRadius: 'xl',
            bg: 'bgSurface',
            pl: '10',
            pr: '4',
            py: '2.5',
            fontSize: 'sm',
            color: 'textPrimary',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            _placeholder: { color: 'textMuted' },
            _hover: { borderColor: { base: 'slate.300', _dark: 'slate.600' } },
            _focus: {
              outline: 'none',
              borderColor: 'accent',
              boxShadow: '0 0 0 3px rgba(6, 182, 212, 0.18)',
            },
          })}
          defaultValue={query}
          name="q"
          placeholder="Search by club, region, or address"
          type="search"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={css({
            position: 'absolute',
            left: '3.5',
            top: '50%',
            transform: 'translateY(-50%)',
            w: '4.5',
            h: '4.5',
            color: 'textMuted',
            pointerEvents: 'none',
          })}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      <div className={css({ position: 'relative', w: 'full' })}>
        <select
          className={css({
            w: 'full',
            appearance: 'none',
            borderWidth: '1px',
            borderColor: 'borderSubtle',
            borderRadius: 'xl',
            bg: 'bgSurface',
            pl: '4',
            pr: '10',
            py: '2.5',
            fontSize: 'sm',
            color: 'textPrimary',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            _hover: { borderColor: { base: 'slate.300', _dark: 'slate.600' } },
            _focus: {
              outline: 'none',
              borderColor: 'accent',
              boxShadow: '0 0 0 3px rgba(6, 182, 212, 0.18)',
            },
          })}
          defaultValue={selectedRegion ?? ''}
          name="region"
          onChange={(e) => e.target.form?.requestSubmit()}
        >
          <option value="">All regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={css({
            position: 'absolute',
            right: '3.5',
            top: '50%',
            transform: 'translateY(-50%)',
            w: '4.5',
            h: '4.5',
            color: 'textMuted',
            pointerEvents: 'none',
          })}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </form>
  )
}
