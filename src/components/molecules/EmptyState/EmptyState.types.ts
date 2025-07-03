// Task #15: Build Transcript Library UI - EmptyState types
import { IconName } from '../../atoms/Icon';

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}