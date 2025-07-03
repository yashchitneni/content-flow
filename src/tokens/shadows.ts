export const shadows = {
  // Base shadows
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  DEFAULT: '0 4px 6px rgba(0,0,0,0.1)',
  md: '0 8px 16px rgba(0,0,0,0.15)',
  lg: '0 16px 32px rgba(0,0,0,0.2)',
  xl: '0 24px 48px rgba(0,0,0,0.25)',
  
  // Glow effects
  glow: '0 0 40px rgba(107,70,193,0.3)',
  glowIntense: '0 0 60px rgba(107,70,193,0.5)',
  glowBlue: '0 0 40px rgba(0,102,255,0.3)',
  glowSubtle: '0 0 20px rgba(107,70,193,0.2)',
  
  // Inner shadows
  innerSubtle: 'inset 0 2px 4px rgba(0,0,0,0.06)',
  inner: 'inset 0 2px 4px rgba(0,0,0,0.2)',
  innerGlow: 'inset 0 0 20px rgba(107,70,193,0.1)',
  
  // Special effects
  spread: '0 25px 50px -12px rgba(0,0,0,0.5)',
  glass: '0 8px 32px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,0.1)',
  elevation: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
  
  // Dark mode optimized
  darkSm: '0 2px 4px rgba(0,0,0,0.3)',
  darkMd: '0 10px 20px rgba(0,0,0,0.4)',
  darkLg: '0 20px 40px rgba(0,0,0,0.5)',
} as const

export type Shadows = typeof shadows