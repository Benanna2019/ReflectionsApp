import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert className="w-96">
      <Info className="size-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="w-96">
      <AlertCircle className="size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
}

export const Success: Story = {
  render: () => (
    <Alert className="w-96">
      <CheckCircle2 className="size-4 text-primary" />
      <AlertTitle>Success!</AlertTitle>
      <AlertDescription>
        Your reflection has been saved successfully.
      </AlertDescription>
    </Alert>
  ),
}

export const Warning: Story = {
  render: () => (
    <Alert className="w-96">
      <AlertTriangle className="size-4 text-accent" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        You have unsaved changes. Make sure to save before leaving.
      </AlertDescription>
    </Alert>
  ),
}

export const WithoutTitle: Story = {
  render: () => (
    <Alert className="w-96">
      <Info className="size-4" />
      <AlertDescription>
        A simple alert without a title.
      </AlertDescription>
    </Alert>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Alert>
        <CheckCircle2 className="size-4" />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>
          Your reflection has been saved!
        </AlertDescription>
      </Alert>
      
      <Alert>
        <Info className="size-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Don't forget to add a photo.
        </AlertDescription>
      </Alert>
      
      <Alert>
        <AlertTriangle className="size-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          This action cannot be undone.
        </AlertDescription>
      </Alert>
      
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Something went wrong.
        </AlertDescription>
      </Alert>
    </div>
  ),
}

