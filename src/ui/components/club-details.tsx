import { css } from '../../../styled-system/css'

import type { Club } from '@/domain/club'

type ClubDetailsProps = {
  club: Club
}

const normalizePhoneHref = (phone: string): string => phone.replace(/[^\d+]/g, '')

export const ClubDetails = ({ club }: ClubDetailsProps) => {
  return (
    <aside
      className={css({
        bg: 'bgSurface',
        borderWidth: '1px',
        borderColor: 'slate.200',
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
      <a className={css({ color: 'accent', textDecoration: 'underline' })} href={`tel:${normalizePhoneHref(club.phone)}`}>
        {club.phone}
      </a>
    </aside>
  )
}
