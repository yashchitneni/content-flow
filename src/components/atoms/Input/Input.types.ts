import { ReactNode, InputHTMLAttributes, ChangeEvent } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'className'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'search'
  placeholder?: string
  value?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  error?: boolean
  icon?: ReactNode
  maxLength?: number
  fullWidth?: boolean
  className?: string
  'aria-label'?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}