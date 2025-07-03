export const duration = {
  instant: '75ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  xl: '700ms',
} as const

export const easing = {
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const

export const transforms = {
  hover: 'scale(1.02) translateY(-2px)',
  press: 'scale(0.98)',
  float: 'translateY(-4px)',
  lift: 'translateY(-1px)',
} as const

export const keyframes = {
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
  glow: `
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(107,70,193,0.5); }
      50% { box-shadow: 0 0 40px rgba(107,70,193,0.8); }
    }
  `,
  float: `
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `,
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
} as const

export const animation = {
  duration,
  easing,
  transforms,
  keyframes,
} as const

export type Animation = typeof animation