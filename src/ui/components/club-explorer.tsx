'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selectedClubName, setSelectedClubName] = useState<string | undefined>(initialSelectedClubName)
  const selectedClub = clubs.find((club) => club.name === selectedClubName)
  const mapWrapperClass = css({
    borderRadius: 'xl',
    overflow: 'hidden',
    bg: 'bgSurface',
    h: { base: '360px', lg: '640px' },
  })

  useEffect(() => {
    const currentSelected = searchParams.get('club') ?? undefined

    if (currentSelected === selectedClubName) {
      return
    }

    const nextParams = new URLSearchParams(searchParams.toString())

    if (selectedClubName) {
      nextParams.set('club', selectedClubName)
    } else {
      nextParams.delete('club')
    }

    const nextUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname
    router.replace(nextUrl, { scroll: false })
  }, [pathname, router, searchParams, selectedClubName])

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
