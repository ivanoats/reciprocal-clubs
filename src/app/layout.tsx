import type { Metadata } from 'next'
import { Manrope, Space_Grotesk } from 'next/font/google'

import './globals.css'
import 'maplibre-gl/dist/maplibre-gl.css'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'STYC Reciprocal Clubs',
  description: 'Directory and map for reciprocal yacht clubs',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>{children}</body>
    </html>
  )
}
