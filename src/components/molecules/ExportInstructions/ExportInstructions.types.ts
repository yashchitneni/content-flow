export interface ExportInstructionsProps {
  title: string;
  steps: string[];
  exportFolder: string;
  importantNotes: string[];
  onOpenFolder?: () => void;
  onDismiss?: () => void;
}