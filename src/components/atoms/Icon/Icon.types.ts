export type IconName = 
  | 'check-circle'
  | 'x-circle'
  | 'alert-circle'
  | 'info-circle'
  | 'x'
  | 'refresh'
  | 'alert-triangle'
  | 'key'
  | 'eye'
  | 'eye-slash'
  | 'settings'
  | 'folder'
  | 'folder-open'
  | 'palette'
  | 'chart'
  | 'api'
  | 'brain'
  | 'robot'
  | 'database'
  | 'user'
  | 'check'
  | 'minus'
  | 'upload';

export interface IconProps {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}