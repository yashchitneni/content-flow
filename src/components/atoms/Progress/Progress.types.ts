import { HTMLAttributes } from 'react'

export type ProgressVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error'
export type ProgressSize = 'small' | 'medium' | 'large'

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: ProgressVariant
  size?: ProgressSize
  showLabel?: boolean
  label?: string
  indeterminate?: boolean
  className?: string
  'aria-label'?: string
}