'use client'

import { useState } from 'react'

import type { Club } from '@/domain/club'

import { css } from '../../../styled-system/css'
import { ClubList } from './club-list'
import { MapView } from './map-view'

type ClubExplorerProps = {
  clubs: Club[]
}

export const ClubExplorer = ({ clubs }: ClubExplorerProps) => {
  const [selectedClubName, setSelectedClubName] = useState<string | undefined>(clubs[0]?.name)
  const mapWrapperStyle = {
    borderRadius: '0.75rem',
    overflow: 'hidden',
    background: 'var(--colors-bgSurface)',
    height: '360px',
  } as const

  return (
    <div className={css({ display: 'grid', gap: '6', gridTemplateColumns: { base: '1fr', lg: '1.2fr 1fr' } })}>
      <div className={css({ lg: { h: '640px' } })} style={mapWrapperStyle}>
        <MapView clubs={clubs} onSelectClub={setSelectedClubName} selectedClubName={selectedClubName} />
      </div>
      <ClubList clubs={clubs} onSelectClub={setSelectedClubName} selectedClubName={selectedClubName} />
    </div>
  )
}
