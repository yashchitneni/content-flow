// Task #17: Create Content Generation UI - Template System
import React, { useEffect, useState } from 'react';
import { Icon } from '../../atoms/Icon';
import { Badge } from '../../atoms/Badge';
import { TemplateSelectorProps, TemplateCardProps, Template, ContentTemplate } from './TemplateSelector.types';
import { useTemplateStore } from '../../../store/template.store';

// FR-042: Template definitions for Instagram Carousel, Twitter Thread, LinkedIn Article, YouTube Script
const TEMPLATES: Template[] = [
  {
    id: 'instagram-carousel',
    name: 'Instagram Carousel',
    description: 'Multi-slide visual content for Instagram posts',
    icon: 'image',
    maxSlides: 10,
    constraints: {
      slideLimit: 10,
      characterLimit: 2200,
      formatRules: ['Visual-first design', 'Hook in first slide', 'CTA in last slide'],
      platforms: ['Instagram']
    },
    preview: '📱 Slide 1: Hook\n📱 Slide 2-9: Content\n📱 Slide 10: CTA'
  },
  {
    id: 'twitter-thread',
    name: 'Twitter Thread',
    description: 'Connected tweets for detailed storytelling',
    icon: 'message-circle',
    constraints: {
      characterLimit: 280,
      formatRules: ['280 chars per tweet', 'Numbered sequence', 'Engagement hooks'],
      platforms: ['Twitter/X']
    },
    preview: '🧵 1/ Hook tweet\n2/ Key point one\n3/ Key point two\n.../End with CTA'
  },
  {
    id: 'linkedin-article',
    name: 'LinkedIn Article',
    description: 'Professional long-form content for LinkedIn',
    icon: 'file-text',
    constraints: {
      characterLimit: 3000,
      formatRules: ['Professional tone', 'Paragraph breaks', 'Industry insights'],
      platforms: ['LinkedIn']
    },
    preview: '💼 Professional headline\n\nOpening hook...\n\nKey insights...\n\nCall to action'
  },
  {
    id: 'youtube-script',
    name: 'YouTube Script',
    description: 'Video script with timing and visual cues',
    icon: 'video',
    constraints: {
      characterLimit: 10000,
      formatRules: ['Timing markers', 'Visual cues', 'Engagement hooks'],
      platforms: ['YouTube']
    },
    preview: '[0:00] Hook\n[0:15] Introduction\n[1:00] Main content\n[8:00] CTA'
  }
];

const TemplateCard: React.FC<TemplateCardProps> = ({ template, isSelected, onSelect, disabled = false }) => {
  const handleClick = () => {
    if (!disabled) {
      onSelect(template.id);
    }
  };

  return (
    <div
      className={`
        relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md' 
          : 'border-gray-200 dark:border-dark-200 bg-white dark:bg-dark-800 hover:border-gray-300 dark:hover:border-dark-300 hover:bg-gray-50 dark:hover:bg-dark-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={handleClick}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <Icon name="check" className="w-5 h-5 text-primary-600" />
        </div>
      )}
      
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Icon 
            name={template.icon as any} 
            className={`w-8 h-8 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-dark-500'}`}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-dark-600 mb-4">
            {template.description}
          </p>
          
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {template.constraints.platforms.map((platform) => (
                <Badge key={platform} variant="secondary" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>
            
            <div className="text-xs text-gray-500 dark:text-dark-500">
              <div className="font-medium mb-1">Constraints:</div>
              <ul className="space-y-1">
                {template.constraints.formatRules.map((rule, index) => (
                  <li key={index}>• {rule}</li>
                ))}
                {template.constraints.characterLimit && (
                  <li>• Max {template.constraints.characterLimit} characters</li>
                )}
                {template.constraints.slideLimit && (
                  <li>• Max {template.constraints.slideLimit} slides</li>
                )}
              </ul>
            </div>
            
            <div className="bg-gray-100 dark:bg-dark-700 rounded p-3 text-xs text-gray-700 dark:text-dark-400">
              <div className="font-medium mb-1">Preview:</div>
              <pre className="whitespace-pre-wrap font-mono">{template.preview}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect,
  disabled = false,
  className = ''
}) => {
  const { customTemplates } = useTemplateStore();
  const [allTemplates, setAllTemplates] = useState<Template[]>(TEMPLATES);

  useEffect(() => {
    // Merge custom templates with default templates
    const customTemplatesMapped: Template[] = customTemplates
      .filter(template => ['carousel', 'thread', 'article', 'script'].includes(template.template_type))
      .map(template => {
        // Map template types to the expected format
        let mappedId: ContentTemplate;
        switch (template.template_type) {
          case 'carousel':
            mappedId = 'instagram-carousel';
            break;
          case 'thread':
            mappedId = 'twitter-thread';
            break;
          case 'article':
            mappedId = 'linkedin-article';
            break;
          case 'script':
            mappedId = 'youtube-script';
            break;
          default:
            mappedId = 'twitter-thread'; // fallback
        }
        
        return {
          id: mappedId,
          name: template.template_name,
          description: template.description || '',
          icon: 'file-text',
          constraints: {
            formatRules: [],
            platforms: [template.template_type]
          },
          preview: 'Custom template'
        };
      });
    
    setAllTemplates([...TEMPLATES, ...customTemplatesMapped]);
  }, [customTemplates]);

  return (
    <div className={`${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Choose Content Template
        </h2>
        <p className="text-sm text-gray-600 dark:text-dark-600">
          Select a template to generate platform-optimized content from your transcript
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {allTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate === template.id}
            onSelect={onTemplateSelect}
            disabled={disabled}
          />
        ))}
      </div>
      
      {selectedTemplate && (
        <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="check-circle" className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-primary-800 dark:text-primary-300">
              Template selected: {allTemplates.find(t => t.id === selectedTemplate)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};