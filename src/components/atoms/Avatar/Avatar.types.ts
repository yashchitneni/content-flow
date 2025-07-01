import { HTMLAttributes } from 'react'

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge'
export type AvatarVariant = 'circle' | 'square'
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  name?: string
  size?: AvatarSize
  variant?: AvatarVariant
  status?: AvatarStatus
  className?: string
}