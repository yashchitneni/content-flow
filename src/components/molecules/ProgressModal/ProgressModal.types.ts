export interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  message?: string;
  progress?: number;
}

export interface ProgressModalProps {
  isOpen: boolean;
  title: string;
  steps: ProgressStep[];
  currentStep?: string;
  canCancel?: boolean;
  onCancel?: () => void;
  onComplete?: () => void;
  showOverlay?: boolean;
}