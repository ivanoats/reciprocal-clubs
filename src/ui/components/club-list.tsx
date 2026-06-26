import { css } from '../../../styled-system/css'

import type { Club } from '@/domain/club'
import { PinIcon, SailboatIcon, ExternalLinkIcon } from './icons'

type ClubListProps = {
  clubs: Club[]
  selectedClubName?: string
  onSelectClub?: (clubName: string) => void
}

const getRegionColor = (region: string) => {
  const norm = region.toLowerCase()
  if (norm.includes('north')) {
    return {
      bg: { base: 'teal.50', _dark: 'rgba(13, 148, 136, 0.15)' },
      color: { base: 'teal.700', _dark: 'teal.300' },
      border: { base: 'teal.100', _dark: 'rgba(13, 148, 136, 0.3)' },
    }
  }
  if (norm.includes('south')) {
    return {
      bg: { base: 'indigo.50', _dark: 'rgba(79, 70, 229, 0.15)' },
      color: { base: 'indigo.700', _dark: 'indigo.300' },
      border: { base: 'indigo.100', _dark: 'rgba(79, 70, 229, 0.3)' },
    }
  }
  if (norm.includes('islands') || norm.includes('san juan')) {
    return {
      bg: { base: 'cyan.50', _dark: 'rgba(6, 182, 212, 0.15)' },
      color: { base: 'cyan.700', _dark: 'cyan.300' },
      border: { base: 'cyan.100', _dark: 'rgba(6, 182, 212, 0.3)' },
    }
  }
  if (norm.includes('canada') || norm.includes('bc') || norm.includes('british columbia')) {
    return {
      bg: { base: 'rose.50', _dark: 'rgba(244, 63, 94, 0.15)' },
      color: { base: 'rose.700', _dark: 'rose.300' },
      border: { base: 'rose.100', _dark: 'rgba(244, 63, 94, 0.3)' },
    }
  }
  if (norm.includes('inland') || norm.includes('east') || norm.includes('lake') || norm.includes('water')) {
    return {
      bg: { base: 'amber.50', _dark: 'rgba(217, 119, 6, 0.15)' },
      color: { base: 'amber.700', _dark: 'amber.300' },
      border: { base: 'amber.100', _dark: 'rgba(217, 119, 6, 0.3)' },
    }
  }
  return {
    bg: { base: 'slate.50', _dark: 'rgba(100, 116, 139, 0.15)' },
    color: { base: 'slate.700', _dark: 'slate.300' },
    border: { base: 'slate.100', _dark: 'rgba(100, 116, 139, 0.3)' },
  }
}

type ClubListItemProps = {
  club: Club
  isSelected: boolean
  onSelectClub?: (clubName: string) => void
}

const ClubListItem = ({ club, isSelected, onSelectClub }: ClubListItemProps) => {
  const badgeColors = getRegionColor(club.region)

  return (
    <li
      className={css({
        bg: 'bgSurface',
        borderRadius: '2xl',
        borderWidth: '1.5px',
        borderColor: isSelected ? 'accent' : 'borderSubtle',
        overflow: 'hidden',
        boxShadow: isSelected ? 'md' : 'xs',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        _hover: {
          transform: 'translateY(-2px)',
          borderColor: isSelected ? 'accent' : { base: 'slate.300', _dark: 'slate.600' },
          boxShadow: 'md',
        },
      })}
    >
      <button
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5',
          w: 'full',
          p: '5',
          textAlign: 'left',
          bg: 'transparent',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
          _hover: {
            bg: 'bgHover',
          },
          _focusVisible: {
            outline: '2px solid',
            outlineColor: 'accent',
            outlineOffset: '-2.5px',
            borderRadius: 'xl',
          },
        })}
        aria-pressed={isSelected}
        aria-label={`${club.name}, ${club.region}`}
        onClick={() => onSelectClub?.(club.name)}
        type="button"
      >
        <p className={css({ fontFamily: 'heading', fontSize: 'md', fontWeight: '700', color: 'textPrimary', lineHeight: 'snug' })}>
          {club.name}
        </p>

        <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2', alignItems: 'center' })}>
          <span
            className={css({
              px: '2.5',
              py: '0.5',
              borderRadius: 'full',
              fontSize: 'xs',
              fontWeight: '600',
              borderWidth: '1px',
              borderColor: badgeColors.border,
              bg: badgeColors.bg,
              color: badgeColors.color,
            })}
          >
            {club.region}
          </span>

          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '1',
              color: 'textPrimary',
              fontSize: 'xs',
              fontWeight: '600',
              bg: { base: 'slate.100', _dark: 'slate.800' },
              px: '2.5',
              py: '0.5',
              borderRadius: 'md',
            })}
          >
            <SailboatIcon />
            <span>{club.distanceNm} nm</span>
          </div>
        </div>

        <div className={css({ display: 'flex', alignItems: 'flex-start', gap: '1.5', color: 'textMuted', fontSize: 'xs', mt: '0.5' })}>
          <PinIcon />
          <span className={css({ lineHeight: 'normal' })}>{club.address}</span>
        </div>
      </button>
      <div
        className={css({
          px: '5',
          pb: '4',
          pt: '0.5',
          display: 'flex',
          justifyContent: 'flex-end',
        })}
      >
        <a
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 'xs',
            fontWeight: '600',
            color: 'accent',
            px: '3.5',
            py: '1.5',
            borderRadius: 'xl',
            borderWidth: '1px',
            borderColor: 'borderSubtle',
            transition: 'all 0.2s ease',
            _hover: {
              bg: 'bgHover',
              borderColor: 'accent',
            },
          })}
          href={club.website}
          rel="noreferrer"
          target="_blank"
        >
          Visit website
          <ExternalLinkIcon />
        </a>
      </div>
    </li>
  )
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
        maxH: { lg: '640px' },
        overflowY: { lg: 'auto' },
        pr: { lg: '2' },
        _scrollbar: {
          width: '6px',
        },
        '_scrollbarTrack': {
          bg: 'transparent',
        },
        '_scrollbarThumb': {
          bg: 'borderSubtle',
          borderRadius: 'full',
        },
      })}
    >
      {clubs.map((club) => (
        <ClubListItem
          key={club.name}
          club={club}
          isSelected={selectedClubName === club.name}
          onSelectClub={onSelectClub}
        />
      ))}
    </ul>
  )
}

