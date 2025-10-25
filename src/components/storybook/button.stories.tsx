import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../ui/button'
import { Heart, Download, Trash2 } from 'lucide-react'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Basic Examples
export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Save Reflection',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'View Photos',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete Entry',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Cancel',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Skip',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Learn more',
  },
}

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
}

// With Icons
export const WithIcon: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button>
        <Heart className="size-4" />
        Favorite
      </Button>
      <Button variant="secondary">
        <Download className="size-4" />
        Download
      </Button>
      <Button variant="destructive">
        <Trash2 className="size-4" />
        Delete
      </Button>
    </div>
  ),
}

export const IconOnly: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button size="icon">
        <Heart className="size-4" />
      </Button>
      <Button size="icon-sm" variant="outline">
        <Download className="size-4" />
      </Button>
      <Button size="icon-lg" variant="secondary">
        <Trash2 className="size-4" />
      </Button>
    </div>
  ),
}

// States
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
}

// All Variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <Button variant="default">Primary (Sage Green)</Button>
      <Button variant="secondary">Secondary (Terracotta)</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
}

// All Sizes
export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

// Use Case Examples
export const ReflectionActions: Story = {
  name: '📸 Reflection Actions',
  render: () => (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border border-border max-w-md">
      <h3 className="text-lg font-semibold text-foreground">Today's Reflection</h3>
      <div className="flex gap-2">
        <Button className="flex-1">
          <Heart className="size-4" />
          Save Memory
        </Button>
        <Button variant="outline">
          Preview
        </Button>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm">
          Skip Today
        </Button>
        <Button variant="destructive" size="sm">
          <Trash2 className="size-4" />
          Discard
        </Button>
      </div>
    </div>
  ),
}

