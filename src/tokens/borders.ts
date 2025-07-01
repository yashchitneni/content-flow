export const borderRadius = {
  none: '0px',
  sm: '4px',
  DEFAULT: '8px',
  md: '12px',
  lg: '16px',
  full: '9999px',
} as const

export const borderWidth = {
  0: '0px',
  DEFAULT: '1px',
  2: '2px',
  4: '4px',
} as const

export const borders = {
  radius: borderRadius,
  width: borderWidth,
} as const

export type Borders = typeof borders