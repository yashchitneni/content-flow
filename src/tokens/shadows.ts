export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  DEFAULT: '0 4px 6px rgba(0,0,0,0.1)',
  md: '0 8px 16px rgba(0,0,0,0.15)',
  lg: '0 16px 32px rgba(0,0,0,0.2)',
  xl: '0 24px 48px rgba(0,0,0,0.25)',
} as const

export type Shadows = typeof shadows