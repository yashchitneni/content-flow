export type IconName = 
  | 'check'
  | 'check-circle'
  | 'x'
  | 'x-circle'
  | 'alert-circle'
  | 'info-circle'
  | 'upload'
  | 'folder'
  | 'folder-open'
  | 'refresh'
  | 'alert-triangle'
  | 'chevron-down'
  | 'chevron-right'
  | 'search'
  | 'user'
  | 'minus';

export interface IconProps {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}