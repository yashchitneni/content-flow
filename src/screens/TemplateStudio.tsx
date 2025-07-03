import React, { useState, useEffect } from 'react';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { Badge } from '../components/atoms/Badge';
import { Modal } from '../components/atoms/Modal';
import { useUIStore } from '../store/ui.store';
import { invoke } from '../lib/tauri-wrapper';

interface Template {
  template_id: string;
  template_name: string;
  template_type: string;
  description?: string;
  prompt: string;
  constraints?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface TemplateFormData {
  template_name: string;
  template_type: string;
  description: string;
  prompt: string;
  constraints: string;
}

export const TemplateStudio: React.FC = () => {
  const { addNotification } = useUIStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<TemplateFormData>({
    template_name: '',
    template_type: 'custom',
    description: '',
    prompt: '',
    constraints: ''
  });

  // Placeholder templates for the template library
  const placeholderTemplates = {
    thread: {
      name: 'Twitter/X Thread Template',
      description: 'Create engaging Twitter threads with hooks and CTAs',
      prompt: `Create a Twitter/X thread based on the following content.

Use these placeholders:
{{summary}} - The transcript summary
{{key_points}} - Main points extracted
{{content}} - The full transcript content

Thread Structure:
1. Hook tweet - Grab attention
2. Main points - One per tweet
3. Examples/stories - Make it relatable
4. Call to action - Drive engagement

Keep each tweet under 280 characters.`
    },
    carousel: {
      name: 'Instagram Carousel Template',
      description: 'Visual storytelling for Instagram',
      prompt: `Create an Instagram carousel post.

Available placeholders:
{{summary}} - Content summary
{{key_points}} - Key takeaways
{{content}} - Full transcript

Carousel Structure:
- Slide 1: Hook/Title
- Slides 2-8: Key points (one per slide)
- Slide 9: Summary/Recap
- Slide 10: CTA

Keep text concise and visual-friendly.`
    },
    newsletter: {
      name: 'Newsletter Section Template',
      description: 'Engaging newsletter content',
      prompt: `Write a newsletter section based on:

{{content}} - The transcript
{{summary}} - Quick summary
{{key_points}} - Main insights

Newsletter Structure:
- Compelling subject line
- Introduction paragraph
- 3-5 key insights with explanations
- Practical takeaways
- Next steps for readers`
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      // In real implementation, this would call Tauri command
      // const result = await invoke('get_all_templates');
      // For now, use mock data
      const mockTemplates: Template[] = [
        {
          template_id: '1',
          template_name: 'My Custom Thread Template',
          template_type: 'thread',
          description: 'My personalized Twitter thread style',
          prompt: 'Create a thread in my voice...',
          constraints: '{"maxTweets": 8}',
          is_default: false,
          created_at: '2025-01-03T10:00:00Z',
          updated_at: '2025-01-03T10:00:00Z'
        }
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      addNotification('error', 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setFormMode('create');
    setFormData({
      template_name: '',
      template_type: 'custom',
      description: '',
      prompt: '',
      constraints: ''
    });
    setShowForm(true);
  };

  const handleEditTemplate = (template: Template) => {
    setFormMode('edit');
    setSelectedTemplate(template);
    setFormData({
      template_name: template.template_name,
      template_type: template.template_type,
      description: template.description || '',
      prompt: template.prompt,
      constraints: template.constraints || ''
    });
    setShowForm(true);
  };

  const handleDeleteTemplate = async (template: Template) => {
    if (window.confirm(`Are you sure you want to delete "${template.template_name}"?`)) {
      try {
        // await invoke('delete_template', { templateId: template.template_id });
        addNotification('success', 'Template deleted successfully');
        loadTemplates();
      } catch (error) {
        addNotification('error', 'Failed to delete template');
      }
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formMode === 'create') {
        // await invoke('create_template', { templateData: formData });
        addNotification('success', 'Template created successfully');
      } else {
        // await invoke('update_template', { templateId: selectedTemplate?.template_id, templateData: formData });
        addNotification('success', 'Template updated successfully');
      }
      
      setShowForm(false);
      loadTemplates();
    } catch (error) {
      addNotification('error', `Failed to ${formMode} template`);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('prompt-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.prompt;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      setFormData({ ...formData, prompt: newText });
      
      // Reset cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-theme-primary dark:bg-gradient-text dark:bg-clip-text dark:text-transparent mb-2">
                Template Studio
              </h1>
              <p className="text-lg text-theme-secondary">
                Create and manage your content generation templates
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleCreateTemplate}
              icon={<Icon name="plus" className="w-5 h-5" />}
            >
              Create Template
            </Button>
          </div>
        </div>

        {/* Template Library */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-theme-primary mb-4">Template Library</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(placeholderTemplates).map(([type, template]) => (
              <div key={type} className="glass-ultra rounded-xl shadow-theme-glass border border-theme p-6 hover-lift">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-theme-primary">{template.name}</h3>
                  <Badge variant="info" size="sm">{type}</Badge>
                </div>
                <p className="text-sm text-theme-secondary mb-4">{template.description}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setFormMode('create');
                    setFormData({
                      template_name: `My ${template.name}`,
                      template_type: type,
                      description: template.description,
                      prompt: template.prompt,
                      constraints: ''
                    });
                    setShowForm(true);
                  }}
                >
                  Use as Base
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* User Templates */}
        <div>
          <h2 className="text-xl font-semibold text-theme-primary mb-4">My Templates</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-theme-secondary">
                <Icon name="spinner" className="w-5 h-5 animate-spin" />
                Loading templates...
              </div>
            </div>
          ) : templates.length === 0 ? (
            <div className="glass-ultra rounded-xl shadow-theme-glass border border-theme p-12 text-center">
              <Icon name="file-text" className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-theme-primary mb-2">No custom templates yet</h3>
              <p className="text-theme-secondary mb-6">Create your first template to start generating personalized content</p>
              <Button
                variant="primary"
                onClick={handleCreateTemplate}
                icon={<Icon name="plus" className="w-4 h-4" />}
              >
                Create Your First Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.template_id} className="glass-ultra rounded-xl shadow-theme-glass border border-theme p-6 hover-lift">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-theme-primary">{template.template_name}</h3>
                    <Badge variant={template.is_default ? 'secondary' : 'primary'} size="sm">
                      {template.is_default ? 'System' : 'Custom'}
                    </Badge>
                  </div>
                  
                  {template.description && (
                    <p className="text-sm text-theme-secondary mb-4">{template.description}</p>
                  )}
                  
                  <div className="text-xs text-theme-tertiary mb-4">
                    Type: {template.template_type} • 
                    Updated: {new Date(template.updated_at).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                      disabled={template.is_default}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template)}
                      disabled={template.is_default}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Template Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={`${formMode === 'create' ? 'Create' : 'Edit'} Template`}
      >
        <form onSubmit={handleSubmitForm} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={formData.template_name}
              onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
              className="w-full px-4 py-2 glass rounded-lg border border-theme focus:border-primary-500 focus:outline-none"
              placeholder="My Custom Template"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Template Type
            </label>
            <select
              value={formData.template_type}
              onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
              className="w-full px-4 py-2 glass rounded-lg border border-theme focus:border-primary-500 focus:outline-none"
            >
              <option value="thread">Twitter/X Thread</option>
              <option value="carousel">Instagram Carousel</option>
              <option value="article">LinkedIn Article</option>
              <option value="script">YouTube Script</option>
              <option value="newsletter">Newsletter</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 glass rounded-lg border border-theme focus:border-primary-500 focus:outline-none"
              placeholder="Brief description of this template"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Prompt Template
            </label>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm text-theme-secondary">Insert placeholder:</span>
              {['{{content}}', '{{summary}}', '{{key_points}}'].map(placeholder => (
                <button
                  key={placeholder}
                  type="button"
                  onClick={() => insertPlaceholder(placeholder)}
                  className="px-2 py-1 text-xs glass rounded border border-theme hover:bg-theme-hover transition-colors"
                >
                  {placeholder}
                </button>
              ))}
            </div>
            <textarea
              id="prompt-editor"
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              className="w-full px-4 py-2 glass rounded-lg border border-theme focus:border-primary-500 focus:outline-none font-mono text-sm"
              rows={12}
              placeholder="Enter your prompt template here..."
              required
            />
            <p className="text-xs text-theme-tertiary mt-1">
              Use placeholders to insert dynamic content from your transcripts
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Constraints (JSON)
            </label>
            <textarea
              value={formData.constraints}
              onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
              className="w-full px-4 py-2 glass rounded-lg border border-theme focus:border-primary-500 focus:outline-none font-mono text-sm"
              rows={4}
              placeholder='{"maxLength": 1000, "style": "professional"}'
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              {formMode === 'create' ? 'Create Template' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};