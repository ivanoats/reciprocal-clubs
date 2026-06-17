'use client'

import dynamic from 'next/dynamic'

import type { Club } from '@/domain/club'

import { css } from '../../../styled-system/css'

const ClubExplorer = dynamic(() => import('./club-explorer').then((mod) => mod.ClubExplorer), {
  ssr: false,
  loading: () => (
    <div className={css({ h: '360px', lg: { h: '640px' }, display: 'grid', placeItems: 'center', color: 'textMuted' })}>
      Loading map...
    </div>
  ),
})

type ClubExplorerIslandProps = {
  clubs: Club[]
  initialSelectedClubName?: string
}

export const ClubExplorerIsland = ({ clubs, initialSelectedClubName }: ClubExplorerIslandProps) => {
  return <ClubExplorer key={initialSelectedClubName ?? clubs[0]?.name ?? 'none'} clubs={clubs} initialSelectedClubName={initialSelectedClubName} />
}
