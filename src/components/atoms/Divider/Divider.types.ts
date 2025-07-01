import { HTMLAttributes } from 'react'

export type DividerOrientation = 'horizontal' | 'vertical'
export type DividerVariant = 'solid' | 'dashed' | 'dotted'
export type DividerColor = 'gray' | 'primary' | 'secondary'
export type DividerSize = 'thin' | 'medium' | 'thick'
export type DividerSpacing = 'none' | 'small' | 'medium' | 'large'
export type DividerLabelPosition = 'start' | 'center' | 'end'

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: DividerOrientation
  variant?: DividerVariant
  color?: DividerColor
  size?: DividerSize
  spacing?: DividerSpacing
  label?: string
  labelPosition?: DividerLabelPosition
  className?: string
}