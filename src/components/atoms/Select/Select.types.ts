// Task #15: Build Transcript Library UI - Select atom types
export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  error?: boolean;
  errorMessage?: string;
}