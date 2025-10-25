import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}

export const ReflectionStatus: Story = {
  name: '📝 Reflection Status Examples',
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status:</span>
        <Badge>Today</Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Category:</span>
        <Badge variant="secondary">Family Time</Badge>
        <Badge variant="secondary">Outdoor</Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Priority:</span>
        <Badge variant="destructive">Important</Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Count:</span>
        <Badge variant="outline">12 photos</Badge>
      </div>
    </div>
  ),
}

