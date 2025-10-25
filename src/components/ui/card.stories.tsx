import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Heart, Calendar, Image as ImageIcon } from 'lucide-react'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This is the main content area of the card.
        </p>
      </CardContent>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Card with Footer</CardTitle>
        <CardDescription>This card includes footer actions</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Card content with actions in the footer.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  ),
}

export const MemoryCard: Story = {
  name: '📸 Memory Card Example',
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Heart className="size-5 text-primary" />
              A Beautiful Day
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-xs">
              <Calendar className="size-3" />
              October 22, 2025
            </CardDescription>
          </div>
          <Badge>Today</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-40 rounded-md bg-muted flex items-center justify-center">
          <ImageIcon className="size-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Today we went to the park and watched the sunset together. 
          It was one of those perfect moments that I want to remember forever.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm">
          Edit
        </Button>
        <Button size="sm">
          <Heart className="size-4" />
          Save
        </Button>
      </CardFooter>
    </Card>
  ),
}

export const SimpleCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Minimal card with just title and content</p>
      </CardContent>
    </Card>
  ),
}

export const CardGrid: Story = {
  name: 'Card Grid Layout',
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[800px]">
      <Card>
        <CardHeader>
          <CardTitle>Morning Memories</CardTitle>
          <CardDescription>Oct 20, 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Started the day with pancakes...
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Afternoon Adventure</CardTitle>
          <CardDescription>Oct 21, 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We explored the forest trail...
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Evening Smiles</CardTitle>
          <CardDescription>Oct 22, 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Bedtime stories and giggles...
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Weekend Fun</CardTitle>
          <CardDescription>Oct 23, 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Building blanket forts...
          </p>
        </CardContent>
      </Card>
    </div>
  ),
}

