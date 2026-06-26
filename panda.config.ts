import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: ['./src/**/*.test.{js,jsx,ts,tsx}'],
  outdir: 'styled-system',
  jsxFramework: 'react',
  presets: ['@pandacss/preset-panda'],
  theme: {
    extend: {
      tokens: {
        fonts: {
          heading: { value: 'var(--font-space-grotesk)' },
          body: { value: 'var(--font-manrope)' },
        },
      },
      semanticTokens: {
        colors: {
          bgCanvas: {
            value: {
              _light: '{colors.slate.50}',
              _dark: '{colors.slate.950}',
            },
          },
          bgSurface: {
            value: {
              _light: '{colors.white}',
              _dark: '{colors.slate.900}',
            },
          },
          textPrimary: {
            value: {
              _light: '{colors.slate.900}',
              _dark: '{colors.slate.100}',
            },
          },
          textMuted: {
            value: {
              _light: '{colors.slate.600}',
              _dark: '{colors.slate.300}',
            },
          },
          accent: {
            value: {
              _light: '{colors.cyan.600}',
              _dark: '{colors.cyan.400}',
            },
          },
          bgHover: {
            value: {
              _light: '{colors.slate.50}',
              _dark: '{colors.slate.800}',
            },
          },
          borderSubtle: {
            value: {
              _light: '{colors.slate.200}',
              _dark: '{colors.slate.700}',
            },
          },
        },
      },
    },
  },
  preflight: true,
})
