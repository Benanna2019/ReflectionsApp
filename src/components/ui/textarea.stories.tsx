import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from './textarea'
import { Label } from './label'
import { Button } from './button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Type your message here...',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-96 space-y-2">
      <Label htmlFor="message">Your Message</Label>
      <Textarea id="message" placeholder="Type your message here..." />
    </div>
  ),
}

export const WithRows: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div className="space-y-2">
        <Label>Small (3 rows)</Label>
        <Textarea placeholder="Small textarea..." rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Medium (5 rows)</Label>
        <Textarea placeholder="Medium textarea..." rows={5} />
      </div>
      <div className="space-y-2">
        <Label>Large (8 rows)</Label>
        <Textarea placeholder="Large textarea..." rows={8} />
      </div>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled textarea',
    disabled: true,
  },
}

export const WithValue: Story = {
  args: {
    value: 'This is a pre-filled textarea with some content.',
    readOnly: true,
  },
}

export const ReflectionInput: Story = {
  name: '📝 Reflection Input Example',
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Today's Reflection</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          What made you smile today?
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reflection">Your thoughts</Label>
          <Textarea
            id="reflection"
            placeholder="Today was special because..."
            rows={6}
            className="resize-none"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Write as much as you'd like - this is your space to remember.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost">Save Draft</Button>
        <Button>Publish</Button>
      </CardFooter>
    </Card>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div className="space-y-2">
        <Label>Default</Label>
        <Textarea placeholder="Default state" />
      </div>
      
      <div className="space-y-2">
        <Label>With content</Label>
        <Textarea value="This textarea has content" readOnly />
      </div>
      
      <div className="space-y-2">
        <Label>Focused (click to see)</Label>
        <Textarea placeholder="Click to focus" />
      </div>
      
      <div className="space-y-2">
        <Label>Disabled</Label>
        <Textarea placeholder="Disabled" disabled />
      </div>
    </div>
  ),
}

