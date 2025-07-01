import { InputHTMLAttributes, ChangeEvent } from 'react'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  checked?: boolean
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  error?: boolean
  label?: string
  description?: string
  size?: 'small' | 'medium' | 'large'
  name: string
  value: string
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
}