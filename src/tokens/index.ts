export * from './colors';

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px'
} as const;

export const borderRadius = {
  none: '0px',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  full: '9999px'
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  base: '0 4px 6px rgba(0,0,0,0.1)',
  md: '0 8px 16px rgba(0,0,0,0.15)',
  lg: '0 16px 32px rgba(0,0,0,0.2)',
  xl: '0 24px 48px rgba(0,0,0,0.25)'
} as const;

export const animation = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  easing: {
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)'
  }
} as const;

export const zIndex = {
  base: 0,
  dropdown: 10,
  fixed: 20,
  modal: 30,
  notification: 40,
  tooltip: 50
} as const;