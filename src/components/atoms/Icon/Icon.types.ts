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
  | 'upload'
  | 'video'
  | 'file'
  | 'image'
  | 'message-circle'
  | 'file-text'
  | 'chevron-right';

export interface IconProps {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}