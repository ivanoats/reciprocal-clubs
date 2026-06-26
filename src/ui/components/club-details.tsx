import { css } from '../../../styled-system/css'

import type { Club } from '@/domain/club'

type ClubDetailsProps = {
  club: Club
}

const normalizePhoneHref = (phone: string): string => phone.replace(/[^\d+]/g, '')

const hasPhone = (phone: Club['phone']): phone is string => typeof phone === 'string' && phone.length > 0

const PinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={css({ w: '4', h: '4', flexShrink: 0, mt: '0.5' })}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const SailboatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={css({ w: '4', h: '4', flexShrink: 0 })}
  >
    <path d="M22 20H2" />
    <path d="M10 20V2L2 14h8" />
    <path d="M14 20V6l6 8h-6" />
  </svg>
)

const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={css({ w: '4', h: '4', flexShrink: 0 })}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={css({ w: '4', h: '4', ml: '2' })}
  >
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
)

export const ClubDetails = ({ club }: ClubDetailsProps) => {
  return (
    <aside
      className={css({
        bg: 'bgSurface',
        borderWidth: '1.5px',
        borderColor: 'borderSubtle',
        borderRadius: '2xl',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'lg',
        overflow: 'hidden',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      })}
      aria-live="polite"
    >
      {/* Visual Header with wave SVG overlay */}
      <div
        className={css({
          position: 'relative',
          bgGradient: 'to-br',
          gradientFrom: 'cyan.600',
          gradientTo: 'blue.700',
          p: '5',
          color: 'white',
          overflow: 'hidden',
        })}
      >
        <svg
          className={css({
            position: 'absolute',
            bottom: '-1px',
            left: 0,
            w: 'full',
            h: 'auto',
            opacity: 0.12,
            pointerEvents: 'none',
          })}
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ffffff"
            d="M0,192L48,197.3C96,203,192,213,288,202.7C384,192,480,160,576,149.3C672,139,768,149,864,165.3C960,181,1056,203,1152,192C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        <p
          className={css({
            fontSize: '10px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: 'wider',
            color: 'cyan.100',
            mb: '1.5',
          })}
        >
          Selected Reciprocal Club
        </p>
        <h2
          className={css({
            fontFamily: 'heading',
            fontSize: 'lg',
            fontWeight: '800',
            lineHeight: 'tight',
          })}
        >
          {club.name}
        </h2>
      </div>

      {/* Info body */}
      <div className={css({ p: '5', display: 'flex', flexDirection: 'column', gap: '4' })}>
        <div className={css({ display: 'grid', gap: '3' })}>
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2', color: 'textPrimary', fontSize: 'sm', fontWeight: '600' })}>
            <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'center', w: '7', h: '7', borderRadius: 'md', bg: { base: 'cyan.50', _dark: 'rgba(6, 182, 212, 0.15)' }, color: 'accent' })}>
              <SailboatIcon />
            </div>
            <span>{club.distanceNm} nautical miles from Seattle</span>
          </div>

          <div className={css({ display: 'flex', alignItems: 'flex-start', gap: '2', color: 'textMuted', fontSize: 'sm' })}>
            <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'center', w: '7', h: '7', borderRadius: 'md', bg: { base: 'slate.100', _dark: 'slate.800' }, color: 'textMuted', mt: '0.5' })}>
              <PinIcon />
            </div>
            <div className={css({ display: 'flex', flexDirection: 'column' })}>
              <span className={css({ fontWeight: '600', color: 'textPrimary' })}>{club.region}</span>
              <span className={css({ mt: '0.5', fontSize: 'xs' })}>{club.address}</span>
            </div>
          </div>
        </div>

        {/* Dynamic call and web CTA buttons */}
        <div className={css({ display: 'flex', flexDirection: { base: 'column', sm: 'row' }, gap: '2.5', mt: '1', pt: '4', borderTop: '1px solid', borderColor: 'borderSubtle/60' })}>
          <a
            className={css({
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgGradient: 'to-br',
              gradientFrom: 'cyan.500',
              gradientTo: 'blue.600',
              color: 'white',
              px: '4',
              py: '2.5',
              borderRadius: 'xl',
              fontSize: 'xs',
              fontWeight: '700',
              boxShadow: '0 4px 12px 0 rgba(6, 182, 212, 0.25)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              _hover: {
                transform: 'translateY(-1.5px)',
                boxShadow: '0 6px 16px 0 rgba(6, 182, 212, 0.35)',
              },
              _active: {
                transform: 'translateY(0)',
              },
            })}
            href={club.website}
            rel="noreferrer"
            target="_blank"
          >
            Visit Website
            <ExternalLinkIcon />
          </a>

          {hasPhone(club.phone) ? (
            <a
              className={css({
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2',
                borderWidth: '1.5px',
                borderColor: 'borderSubtle',
                color: 'textPrimary',
                bg: 'bgSurface',
                px: '4',
                py: '2.5',
                borderRadius: 'xl',
                fontSize: 'xs',
                fontWeight: '700',
                transition: 'all 0.2s ease',
                _hover: {
                  bg: 'bgHover',
                  borderColor: { base: 'slate.400', _dark: 'slate.500' },
                },
              })}
              href={`tel:${normalizePhoneHref(club.phone)}`}
            >
              <PhoneIcon />
              {club.phone}
            </a>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
