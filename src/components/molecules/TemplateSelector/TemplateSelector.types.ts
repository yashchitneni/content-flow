// Task #17: Create Content Generation UI - Template System

export type ContentTemplate = 'instagram-carousel' | 'twitter-thread' | 'linkedin-article' | 'youtube-script';

export interface Template {
  id: ContentTemplate;
  name: string;
  description: string;
  icon: string;
  maxLength?: number;
  maxSlides?: number;
  constraints: TemplateConstraints;
  preview: string;
}

export interface TemplateConstraints {
  characterLimit?: number;
  slideLimit?: number;
  formatRules: string[];
  platforms: string[];
}

export interface TemplateSelectorProps {
  selectedTemplate?: ContentTemplate;
  onTemplateSelect: (template: ContentTemplate) => void;
  disabled?: boolean;
  className?: string;
}

export interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: (templateId: ContentTemplate) => void;
  disabled?: boolean;
}