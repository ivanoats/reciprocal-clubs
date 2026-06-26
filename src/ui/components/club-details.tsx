import { css } from '../../../styled-system/css'

import type { Club } from '@/domain/club'

type ClubDetailsProps = {
  club: Club
}

const normalizePhoneHref = (phone: string): string => phone.replace(/[^\d+]/g, '')

const hasPhone = (phone: Club['phone']): phone is string => typeof phone === 'string' && phone.length > 0

export const ClubDetails = ({ club }: ClubDetailsProps) => {
  return (
    <aside
      className={css({
        bg: 'bgSurface',
        borderWidth: '1px',
        borderColor: 'borderSubtle',
        borderRadius: 'lg',
        p: '4',
        display: 'grid',
        gap: '2',
      })}
      aria-live="polite"
    >
      <p className={css({ fontFamily: 'heading', fontWeight: '700', fontSize: 'lg', color: 'textPrimary' })}>
        {club.name}
      </p>
      <p className={css({ color: 'textMuted', fontSize: 'sm' })}>{club.region}</p>
      <p className={css({ color: 'textMuted' })}>{club.address}</p>
      <p className={css({ color: 'textPrimary', fontWeight: '500' })}>{club.distanceNm} nm from Seattle</p>
      <a
        className={css({ color: 'accent', textDecoration: 'underline' })}
        href={club.website}
        rel="noreferrer"
        target="_blank"
      >
        Website
      </a>
      {hasPhone(club.phone) ? (
        <a className={css({ color: 'accent', textDecoration: 'underline' })} href={`tel:${normalizePhoneHref(club.phone)}`}>
          {club.phone}
        </a>
      ) : null}
    </aside>
  )
}
