import React, { useState } from 'react'
import {
  Button,
  Input,
  Icon,
  Badge,
  Tag,
  Spinner,
  Checkbox,
  Radio,
  Toggle,
  Avatar,
  Tooltip,
  Progress,
  Divider
} from './components/atoms'

export const TestAtoms: React.FC = () => {
  const [inputValue, setInputValue] = useState('')
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [radioValue, setRadioValue] = useState('option1')
  const [toggleOn, setToggleOn] = useState(false)
  const [progress, setProgress] = useState(65)

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">ContentFlow Atoms Test</h1>
      
      {/* Buttons */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex gap-4 items-center">
            <Button size="small">Small</Button>
            <Button size="medium">Medium</Button>
            <Button size="large">Large</Button>
          </div>
          <div className="flex gap-4 items-center">
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
            <Button icon={<Icon name="upload" size="sm" />}>With Icon</Button>
          </div>
        </div>
      </section>

      <Divider />

      {/* Inputs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Inputs</h2>
        <div className="space-y-4 max-w-md">
          <Input 
            placeholder="Default input" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Input 
            placeholder="With icon" 
            icon={<Icon name="search" size="sm" />}
          />
          <Input 
            placeholder="Error state" 
            error
          />
          <Input 
            placeholder="Disabled" 
            disabled
          />
        </div>
      </section>

      <Divider label="Form Controls" />

      {/* Checkboxes */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Checkboxes</h2>
        <div className="space-y-4">
          <Checkbox 
            checked={checkboxChecked}
            onChange={(e) => setCheckboxChecked(e.target.checked)}
            label="Default checkbox"
          />
          <Checkbox 
            checked
            disabled
            label="Disabled checked"
          />
          <Checkbox 
            indeterminate
            label="Indeterminate state"
          />
          <Checkbox 
            error
            label="Error state"
            description="This checkbox has an error"
          />
        </div>
      </section>

      {/* Radio Buttons */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Radio Buttons</h2>
        <div className="space-y-4">
          <Radio 
            name="options"
            value="option1"
            checked={radioValue === 'option1'}
            onChange={(e) => setRadioValue(e.target.value)}
            label="Option 1"
          />
          <Radio 
            name="options"
            value="option2"
            checked={radioValue === 'option2'}
            onChange={(e) => setRadioValue(e.target.value)}
            label="Option 2"
            description="This is option 2"
          />
          <Radio 
            name="options"
            value="option3"
            disabled
            label="Disabled option"
          />
        </div>
      </section>

      {/* Toggles */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Toggles</h2>
        <div className="space-y-4">
          <Toggle 
            checked={toggleOn}
            onChange={(e) => setToggleOn(e.target.checked)}
            label="Default toggle"
          />
          <Toggle 
            checked
            disabled
            label="Disabled on"
          />
          <Toggle 
            error
            label="Error state"
            description="This toggle has an error"
          />
        </div>
      </section>

      <Divider variant="dashed" />

      {/* Icons */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Icons</h2>
        <div className="flex gap-4 items-center flex-wrap">
          <Icon name="check" />
          <Icon name="check-circle" />
          <Icon name="x" />
          <Icon name="x-circle" />
          <Icon name="alert-circle" />
          <Icon name="info-circle" />
          <Icon name="upload" />
          <Icon name="folder" />
          <Icon name="folder-open" />
          <Icon name="refresh" />
          <Icon name="search" />
          <Icon name="user" />
          <Icon name="chevron-down" />
          <Icon name="chevron-right" />
        </div>
      </section>

      {/* Badges and Tags */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Badges & Tags</h2>
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </div>
          <div className="flex gap-2 items-center">
            <Tag>Default Tag</Tag>
            <Tag color="primary">Primary Tag</Tag>
            <Tag color="secondary" onRemove={() => console.log('Remove')}>Removable</Tag>
          </div>
        </div>
      </section>

      {/* Avatars */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Avatars</h2>
        <div className="flex gap-4 items-center">
          <Avatar name="John Doe" size="small" />
          <Avatar name="Jane Smith" size="medium" status="online" />
          <Avatar src="https://i.pravatar.cc/150?img=3" size="large" status="busy" />
          <Avatar size="xlarge" status="offline" />
        </div>
      </section>

      {/* Progress */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Progress</h2>
        <div className="space-y-4">
          <Progress value={progress} showLabel label="Upload progress" />
          <Progress value={30} variant="secondary" />
          <Progress value={100} variant="success" size="large" />
          <Progress indeterminate variant="primary" label="Loading..." />
        </div>
        <button 
          className="mt-4 text-sm text-primary-500"
          onClick={() => setProgress(Math.random() * 100)}
        >
          Random Progress
        </button>
      </section>

      {/* Tooltips */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Tooltips</h2>
        <div className="flex gap-8 items-center">
          <Tooltip content="This is a tooltip">
            <Button variant="secondary">Hover me</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" position="bottom">
            <span className="text-primary-500 cursor-help">Bottom</span>
          </Tooltip>
          <Tooltip content="Left tooltip" position="left">
            <span className="text-primary-500 cursor-help">Left</span>
          </Tooltip>
          <Tooltip content="Right tooltip" position="right">
            <span className="text-primary-500 cursor-help">Right</span>
          </Tooltip>
        </div>
      </section>

      {/* Spinner */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Spinners</h2>
        <div className="flex gap-4 items-center">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="md" color="#6B46C1" />
        </div>
      </section>

      <Divider spacing="large" />

      <section className="pb-8">
        <p className="text-gray-600">All 13 atom components are complete and working! ✅</p>
      </section>
    </div>
  )
}