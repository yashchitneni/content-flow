import React, { useState } from 'react'
import { Button, Input, Badge, Icon, Spinner, Tag } from '@/components/atoms'
import { colors } from '@/tokens'

export const WelcomeScreen: React.FC = () => {
  const [inputValue, setInputValue] = useState('')
  const [tags, setTags] = useState(['Content Creation', 'Video Processing', 'AI-Powered'])
  const [isLoading, setIsLoading] = useState(false)

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const handleTestLoading = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to ContentFlow
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered Content Creation Studio
          </p>
        </div>

        {/* Status Badges */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">System Status</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="success">✅ Tauri Initialized</Badge>
            <Badge variant="info">🔐 Descript OAuth Ready</Badge>
            <Badge variant="warning">🤖 LangGraph Configured</Badge>
            <Badge variant="primary">⚡ Error Handling Active</Badge>
          </div>
        </div>

        {/* Components Showcase */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Component Library</h2>
          
          {/* Buttons */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={handleTestLoading}>
                {isLoading ? <Spinner size="sm" color="white" /> : 'Primary Button'}
              </Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Danger Button</Button>
            </div>
          </div>

          {/* Input */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Input Fields</h3>
            <div className="space-y-3 max-w-md">
              <Input
                placeholder="Enter your content..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                fullWidth
              />
              <Input
                placeholder="Error state example"
                variant="error"
                fullWidth
              />
              <Input
                placeholder="Success state example"
                variant="success"
                fullWidth
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Tag
                  key={index}
                  color="primary"
                  onRemove={() => handleRemoveTag(index)}
                >
                  {tag}
                </Tag>
              ))}
              <Tag color="gray">Non-removable Tag</Tag>
            </div>
          </div>

          {/* Icons */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Icons</h3>
            <div className="flex gap-4 items-center">
              <Icon name="check-circle" size="sm" color={colors.semantic.success[500]} />
              <Icon name="alert-circle" size="md" color={colors.semantic.warning[500]} />
              <Icon name="x-circle" size="lg" color={colors.semantic.error[500]} />
              <Icon name="info-circle" size="lg" color={colors.semantic.info[500]} />
            </div>
          </div>

          {/* Spinner */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Loading States</h3>
            <div className="flex gap-4 items-center">
              <Spinner size="sm" color={colors.primary[500]} />
              <Spinner size="md" color={colors.secondary[500]} />
              <Spinner size="lg" color={colors.neutral.gray[600]} />
            </div>
          </div>
        </div>

        {/* Feature Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold mb-4">Ready Features</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Icon name="check-circle" color={colors.semantic.success[500]} />
              <span className="text-gray-700">Project Structure (Tauri + React + TypeScript)</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="check-circle" color={colors.semantic.success[500]} />
              <span className="text-gray-700">Design Token System (Colors, Typography, Spacing)</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="check-circle" color={colors.semantic.success[500]} />
              <span className="text-gray-700">Descript OAuth Authentication</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="check-circle" color={colors.semantic.success[500]} />
              <span className="text-gray-700">LangGraph Workflow System</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="check-circle" color={colors.semantic.success[500]} />
              <span className="text-gray-700">Error Handling & Toast Notifications</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}