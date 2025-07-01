export const duration = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
} as const

export const easing = {
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
} as const

export const animation = {
  duration,
  easing,
} as const

export type Animation = typeof animation