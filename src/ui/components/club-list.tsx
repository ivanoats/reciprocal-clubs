import { css } from '../../../styled-system/css'

import type { Club } from '@/domain/club'

type ClubListProps = {
  clubs: Club[]
  selectedClubName?: string
  onSelectClub?: (clubName: string) => void
}

export const ClubList = ({ clubs, selectedClubName, onSelectClub }: ClubListProps) => {
  return (
    <ul
      className={css({
        display: 'grid',
        gap: '4',
        listStyle: 'none',
        p: 0,
        m: 0,
      })}
    >
      {clubs.map((club) => (
        <li
          key={club.name}
          className={css({
            bg: 'bgSurface',
            borderRadius: 'lg',
            borderWidth: '1px',
            borderColor: selectedClubName === club.name ? 'accent' : 'slate.200',
            overflow: 'hidden',
          })}
        >
          <button
            className={css({
              display: 'grid',
              gap: '1',
              w: 'full',
              p: '4',
              textAlign: 'left',
              bg: 'transparent',
              cursor: 'pointer',
              transition: 'all 120ms ease',
              _hover: {
                bg: 'slate.50',
              },
              _focusVisible: {
                outline: '2px solid',
                outlineColor: 'accent',
                outlineOffset: '2px',
              },
            })}
            aria-pressed={selectedClubName === club.name}
            aria-label={`${club.name}, ${club.region}`}
            onClick={() => onSelectClub?.(club.name)}
            type="button"
          >
            <p className={css({ fontFamily: 'heading', fontWeight: '700', color: 'textPrimary' })}>{club.name}</p>
            <p className={css({ color: 'textMuted', fontSize: 'sm' })}>{club.region}</p>
            <p className={css({ color: 'textMuted', fontSize: 'sm' })}>{club.address}</p>
            <p className={css({ mt: '1', color: 'textPrimary', fontWeight: '500' })}>{club.distanceNm} nm from Seattle</p>
          </button>
          <div className={css({ px: '4', pb: '4' })}>
            <a
              className={css({
                display: 'inline-block',
                color: 'accent',
                textDecoration: 'underline',
              })}
              href={club.website}
              rel="noreferrer"
              target="_blank"
            >
              Visit website
            </a>
          </div>
        </li>
      ))}
    </ul>
  )
}
