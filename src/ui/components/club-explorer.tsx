'use client'

import { useEffect, useState } from 'react'

import type { Club } from '@/domain/club'

import { css } from '../../../styled-system/css'
import { ClubDetails } from './club-details'
import { ClubList } from './club-list'
import { MapView } from './map-view'

type ClubExplorerProps = {
  clubs: Club[]
  initialSelectedClubName?: string
}

export const ClubExplorer = ({ clubs, initialSelectedClubName }: ClubExplorerProps) => {
  const [selectedClubName, setSelectedClubName] = useState<string | undefined>(initialSelectedClubName)
  const selectedClub = clubs.find((club) => club.name === selectedClubName)
  const mapWrapperClass = css({
    borderRadius: 'xl',
    overflow: 'hidden',
    bg: 'bgSurface',
    h: { base: '360px', lg: '640px' },
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const url = new URL(window.location.href)
    const currentSelected = url.searchParams.get('club') ?? undefined
    if (currentSelected === selectedClubName) {
      return
    }
    if (selectedClubName) {
      url.searchParams.set('club', selectedClubName)
    } else {
      url.searchParams.delete('club')
    }
    window.history.replaceState(window.history.state, '', url.toString())
  }, [selectedClubName])

  return (
    <div className={css({ display: 'grid', gap: '6', gridTemplateColumns: { base: '1fr', lg: '1.2fr 1fr' } })}>
      <div className={mapWrapperClass}>
        <MapView clubs={clubs} onSelectClub={setSelectedClubName} selectedClubName={selectedClubName} />
      </div>
      <div className={css({ display: 'grid', gap: '4' })}>
        {selectedClub ? <ClubDetails club={selectedClub} /> : null}
        <ClubList clubs={clubs} onSelectClub={setSelectedClubName} selectedClubName={selectedClubName} />
      </div>
    </div>
  )
}
