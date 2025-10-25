import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Heart, CheckCircle2, AlertCircle, Info } from 'lucide-react'

const meta = {
  title: 'Design System/Colors & Typography',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ColorPalette: Story = {
  render: () => (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        <header>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🎨 Reflections Design System
          </h1>
          <p className="text-muted-foreground text-lg">
            Warm, earth-tone color palette inspired by vintage scrapbooks
          </p>
        </header>

        {/* Brand Colors */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
            Brand Colors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ColorSwatch
              name="Primary"
              description="Sage Green - Natural, calming"
              className="bg-primary text-primary-foreground"
            />
            <ColorSwatch
              name="Secondary"
              description="Terracotta - Warm, earthy"
              className="bg-secondary text-secondary-foreground"
            />
            <ColorSwatch
              name="Accent"
              description="Amber/Honey - Warm highlight"
              className="bg-accent text-accent-foreground"
            />
            <ColorSwatch
              name="Muted"
              description="Soft Tan - Subtle background"
              className="bg-muted text-muted-foreground"
            />
          </div>
        </section>

        {/* Semantic Colors */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
            Semantic Colors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <ColorSwatch
              name="Background"
              description="Warm cream/beige"
              className="bg-background text-foreground border border-border"
            />
            <ColorSwatch
              name="Card"
              description="Slightly lighter cream"
              className="bg-card text-card-foreground border border-border"
            />
            <ColorSwatch
              name="Destructive"
              description="Muted terracotta red"
              className="bg-destructive text-destructive-foreground"
            />
          </div>
        </section>

        {/* Chart Colors */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">
            Chart Colors
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            <div className="h-24 bg-chart-1 rounded-lg shadow-sm" />
            <div className="h-24 bg-chart-2 rounded-lg shadow-sm" />
            <div className="h-24 bg-chart-3 rounded-lg shadow-sm" />
            <div className="h-24 bg-chart-4 rounded-lg shadow-sm" />
            <div className="h-24 bg-chart-5 rounded-lg shadow-sm" />
          </div>
          <div className="text-sm text-muted-foreground">
            Moss Green • Warm Gold • Terracotta • Soft Teal • Peachy Coral
          </div>
        </section>
      </div>
    </div>
  ),
}

export const Typography: Story = {
  render: () => (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto space-y-12">
        <header>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Typography Scale
          </h1>
          <p className="text-muted-foreground">
            Warm brown text on cream background for readability
          </p>
        </header>

        <section className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-foreground">
              Heading 1 - Bold
            </h1>
            <code className="text-sm text-muted-foreground">text-5xl font-bold</code>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-semibold text-foreground">
              Heading 2 - Semibold
            </h2>
            <code className="text-sm text-muted-foreground">text-4xl font-semibold</code>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-semibold text-foreground">
              Heading 3 - Semibold
            </h3>
            <code className="text-sm text-muted-foreground">text-3xl font-semibold</code>
          </div>

          <div className="space-y-2">
            <h4 className="text-2xl font-semibold text-foreground">
              Heading 4 - Semibold
            </h4>
            <code className="text-sm text-muted-foreground">text-2xl font-semibold</code>
          </div>

          <div className="space-y-2">
            <h5 className="text-xl font-medium text-foreground">
              Heading 5 - Medium
            </h5>
            <code className="text-sm text-muted-foreground">text-xl font-medium</code>
          </div>

          <div className="space-y-2">
            <p className="text-lg text-foreground">
              Large Body Text - This is larger paragraph text that might be used for introductions or important content.
            </p>
            <code className="text-sm text-muted-foreground">text-lg</code>
          </div>

          <div className="space-y-2">
            <p className="text-base text-foreground">
              Body Text - This is the standard paragraph text used throughout the application. It should be comfortable to read for extended periods. The warm brown color on cream background creates a gentle, inviting reading experience reminiscent of vintage scrapbooks.
            </p>
            <code className="text-sm text-muted-foreground">text-base</code>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Small Text - Used for captions, helper text, and secondary information that doesn't need as much prominence.
            </p>
            <code className="text-sm text-muted-foreground">text-sm text-muted-foreground</code>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Extra Small Text - Used for metadata, timestamps, and fine print.
            </p>
            <code className="text-sm text-muted-foreground">text-xs text-muted-foreground</code>
          </div>
        </section>
      </div>
    </div>
  ),
}

export const ComponentExamples: Story = {
  name: 'Component Showcase',
  render: () => (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Cards (shadcn)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="size-5 text-primary" />
                  Memory Card
                </CardTitle>
                <CardDescription>
                  October 22, 2025
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is what a reflection card might look like with warm, inviting colors using shadcn Card component.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Another Card</CardTitle>
                <CardDescription>
                  A day in the life
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Notice the soft borders, warm background, and rounded corners.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Badges (shadcn)</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* Alerts */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Alerts (shadcn)</h2>
          <div className="space-y-3">
            <Alert>
              <CheckCircle2 className="size-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your reflection has been saved! ✨
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Info className="size-4" />
              <AlertTitle>Info</AlertTitle>
              <AlertDescription>
                Don't forget to add a photo to complete your entry.
              </AlertDescription>
            </Alert>
            
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Please check your connection and try again.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Buttons (shadcn)</h2>
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </section>

        {/* Form Components */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Form Components (shadcn)</h2>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Reflection Form</CardTitle>
              <CardDescription>
                All form components use our warm color palette
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="memory">Your Memory</Label>
                <Textarea
                  id="memory"
                  placeholder="Write your reflection here..."
                  rows={4}
                />
              </div>
              
              <Button className="w-full">
                <Heart className="size-4" />
                Save Memory
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  ),
}

// Helper component
function ColorSwatch({ name, description, className }: { name: string; description: string; className: string }) {
  return (
    <div className="space-y-3">
      <div className={`h-32 rounded-lg shadow-sm ${className} flex items-center justify-center text-center p-4`}>
        <div className="font-semibold">{name}</div>
      </div>
      <div>
        <div className="font-medium text-sm text-foreground">{name}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  )
}

