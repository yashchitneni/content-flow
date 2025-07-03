export * from './colors'
export * from './typography'
export * from './spacing'
export * from './borders'
export * from './shadows'
export * from './animation'
export * from './breakpoints'
export * from './zIndex'

import { colors, gradients } from './colors'
import { typography } from './typography'
import { spacing } from './spacing'
import { borders } from './borders'
import { shadows } from './shadows'
import { animation } from './animation'
import { breakpoints } from './breakpoints'
import { zIndex } from './zIndex'

export const tokens = {
  colors,
  gradients,
  typography,
  spacing,
  borders,
  shadows,
  animation,
  breakpoints,
  zIndex,
} as const

export type Tokens = typeof tokens