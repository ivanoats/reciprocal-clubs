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

  return (
    <div className={css({ display: 'grid', gap: '6', gridTemplateColumns: { base: '1fr', lg: '1.2fr 1fr' } })}>
      <div className={css({ borderRadius: 'xl', overflow: 'hidden', minH: { base: '360px', lg: '640px' } })}>
        <MapView clubs={clubs} onSelectClub={setSelectedClubName} selectedClubName={selectedClubName} />
      </div>
      <ClubList clubs={clubs} onSelectClub={setSelectedClubName} selectedClubName={selectedClubName} />
    </div>
  )
}
