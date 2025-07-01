import { ReactNode, HTMLAttributes } from 'react'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  content: ReactNode
  position?: TooltipPosition
  delay?: number
  className?: string
}