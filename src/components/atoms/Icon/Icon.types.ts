export type IconName = 
  | 'check-circle'
  | 'x-circle'
  | 'alert-circle'
  | 'info-circle'
  | 'x'
  | 'refresh'
  | 'alert-triangle';

export interface IconProps {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}