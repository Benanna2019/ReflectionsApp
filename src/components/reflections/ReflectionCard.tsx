import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Calendar, Sparkles } from 'lucide-react'

interface ReflectionCardProps {
  reflection: {
    id: string
    reflectionText: string
    createdAt: number
    photo?: {
      id: string
      path: string
      url: string
    }
    prompt?: {
      id: string
      promptText: string
    }
  }
}

/**
 * ReflectionCard Component
 * 
 * Displays a single reflection with photo and text
 * Can be collapsed/expanded
 */
export function ReflectionCard({ reflection }: ReflectionCardProps) {
  const [isVisible, setIsVisible] = useState(false)

  /**
   * Format date for display
   */
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Reset hours for comparison
    today.setHours(0, 0, 0, 0)
    yesterday.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    if (date.getTime() === today.getTime()) {
      return 'Today'
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Yesterday'
    } else {
      return new Date(timestamp).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
  }

  /**
   * Toggle visibility
   */
  const handleToggle = () => {
    setIsVisible(!isVisible)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">
              {formatDate(reflection.createdAt)}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prompt */}
        {reflection.prompt && (
          <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground italic">
              {reflection.prompt.promptText}
            </p>
          </div>
        )}

        {/* Photo */}
        {isVisible && reflection.photo?.url && (
          <div className="relative">
            <img
              src={reflection.photo.url}
              alt="Reflection photo"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Text */}
        {isVisible && reflection.reflectionText && (
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground whitespace-pre-wrap">{reflection.reflectionText}</p>
          </div>
        )}

        {/* Toggle Button */}
        <div className="pt-2">
          {!isVisible ? (
            <Button
              onClick={handleToggle}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Reflection
            </Button>
          ) : (
            <Button
              onClick={handleToggle}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Hide Reflection
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

