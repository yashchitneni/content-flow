import { InputHTMLAttributes, ChangeEvent } from 'react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  checked?: boolean
  indeterminate?: boolean
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  error?: boolean
  label?: string
  description?: string
  size?: 'small' | 'medium' | 'large'
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
}