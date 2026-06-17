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
          onClick={() => onSelectClub?.(club.name)}
          className={css({
            bg: 'bgSurface',
            borderRadius: 'lg',
            borderWidth: '1px',
            borderColor: selectedClubName === club.name ? 'accent' : 'slate.200',
            p: '4',
            cursor: onSelectClub ? 'pointer' : 'default',
            transition: 'all 120ms ease',
            _hover: {
              borderColor: 'accent',
            },
          })}
        >
          <p className={css({ fontFamily: 'heading', fontWeight: '700', color: 'textPrimary' })}>{club.name}</p>
          <p className={css({ color: 'textMuted', fontSize: 'sm' })}>{club.region}</p>
          <p className={css({ color: 'textMuted', fontSize: 'sm' })}>{club.address}</p>
          <p className={css({ mt: '2', color: 'textPrimary', fontWeight: '500' })}>{club.distanceNm} nm from Seattle</p>
          <a
            className={css({
              display: 'inline-block',
              mt: '2',
              color: 'accent',
              textDecoration: 'underline',
            })}
            href={club.website}
            rel="noreferrer"
            target="_blank"
          >
            Visit website
          </a>
        </li>
      ))}
    </ul>
  )
}
