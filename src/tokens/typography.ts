export const fontFamilies = {
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'].join(', '),
  mono: ['SF Mono', 'Monaco', 'monospace'].join(', '),
} as const

export const fontSize = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
} as const

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

export const lineHeight = {
  xs: '16px',
  sm: '20px',
  base: '24px',
  lg: '28px',
  xl: '30px',
  '2xl': '32px',
  '3xl': '38px',
  '4xl': '44px',
} as const

export const letterSpacing = {
  normal: '0',
  tight: '-0.02em',
} as const

export const typography = {
  fontFamilies,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
} as const

export type Typography = typeof typography