import React from 'react'
import {
  Button,
  Input,
  Icon,
  Badge,
  Tag,
  Checkbox,
  Radio,
  Toggle,
  Spinner,
  Avatar,
  Tooltip,
  Progress,
  Divider
} from './components/atoms'

// Simple test component to verify all atoms can be imported and used
export const TestAtoms: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Atom Components Test</h1>
      
      <div>
        <h2 className="text-lg font-semibold mb-2">Buttons</h2>
        <div className="flex gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Form Elements</h2>
        <div className="space-y-2">
          <Input placeholder="Enter text..." />
          <Checkbox label="Check me" />
          <Radio label="Select me" name="test" />
          <Toggle label="Toggle me" />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Feedback</h2>
        <div className="flex gap-2 items-center">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Tag color="primary">Tag</Tag>
          <Spinner size="sm" />
          <Progress value={50} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Media & Layout</h2>
        <div className="flex gap-2 items-center">
          <Avatar name="John Doe" />
          <Icon name="check" />
          <Tooltip content="This is a tooltip">
            <span>Hover me</span>
          </Tooltip>
        </div>
      </div>

      <Divider label="Divider" />
    </div>
  )
}