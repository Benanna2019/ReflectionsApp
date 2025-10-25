import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from '../ui/input'
import { SearchIcon, MailIcon, LockIcon } from 'lucide-react'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter your name',
  },
}

export const WithValue: Story = {
  args: {
    value: 'Today was a beautiful day',
    readOnly: true,
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password',
  },
}

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search reflections...',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
}

export const WithIcon: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="relative">
        <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder="Email address"
          className="pl-10"
        />
      </div>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search memories..."
          className="pl-10"
        />
      </div>
      <div className="relative">
        <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="password"
          placeholder="Password"
          className="pl-10"
        />
      </div>
    </div>
  ),
}

export const ReflectionForm: Story = {
  name: '📝 Reflection Form Example',
  render: () => (
    <div className="w-96 p-6 bg-card rounded-lg border border-border space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Today's Reflection</h3>
        <p className="text-sm text-muted-foreground mb-4">
          What made you smile today?
        </p>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Your name
        </label>
        <Input placeholder="Enter your name" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Reflection title
        </label>
        <Input placeholder="Give your memory a title" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Notes
        </label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-input px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Write your thoughts here..."
        />
      </div>
    </div>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Default</label>
        <Input placeholder="Default state" />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">With value</label>
        <Input value="A wonderful memory" readOnly />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Focused (click to see)</label>
        <Input placeholder="Click to focus" />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Disabled</label>
        <Input placeholder="Disabled" disabled />
      </div>
    </div>
  ),
}

