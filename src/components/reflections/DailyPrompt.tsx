import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2 } from 'lucide-react'
import { useQuery } from '@/lib/db'
import { useAuth } from '@/lib/auth/AuthProvider'

/**
 * Default fallback prompts
 * Used when no approved prompts are available in the database
 */
const FALLBACK_PROMPTS = [
  'What made you smile today?',
  'What are you grateful for right now?',
  'What challenged you today, and how did you handle it?',
  'What is something you learned today?',
  'What moment from today would you like to remember?',
  'Who made a positive impact on your day?',
  'What are you looking forward to tomorrow?',
  'What is something beautiful you noticed today?',
]

interface DailyPromptProps {
  onPromptSelected?: (promptId: string | null, promptText: string) => void
}

/**
 * DailyPrompt Component
 * 
 * Displays a daily reflection prompt
 * Queries approved prompts from database or uses fallback prompts
 * Rotates prompts daily to avoid repetition
 */
export function DailyPrompt({ onPromptSelected }: DailyPromptProps) {
  const { user } = useAuth()

  // Query approved prompts
  const { data, isLoading, error } = useQuery({
    prompts: {
      $: {
        where: {
          status: 'active',
        },
        limit: 100,
      },
    },
  })

  /**
   * Select daily prompt based on date
   * Uses deterministic selection so same prompt shows all day
   * Returns both the prompt text and ID (if from database)
   */
  const getDailyPrompt = (): { text: string; id: string | null } => {
    // Get today's date as YYYY-MM-DD
    const today = new Date()
    const dateString = today.toISOString().split('T')[0]
    
    // Create a simple hash from date + userId
    let hash = 0
    const hashString = `${dateString}-${user?.id || 'anonymous'}`
    for (let i = 0; i < hashString.length; i++) {
      hash = ((hash << 5) - hash) + hashString.charCodeAt(i)
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // Use database prompts if available, otherwise use fallback
    const prompts = data?.prompts || []
    const index = Math.abs(hash) % (prompts.length > 0 ? prompts.length : FALLBACK_PROMPTS.length)
    
    if (prompts.length > 0) {
      const selectedPrompt = prompts[index]
      return { text: selectedPrompt.promptText, id: selectedPrompt.id }
    } else {
      return { text: FALLBACK_PROMPTS[index], id: null }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    console.error('Error loading prompts:', error)
    // Fall through to use fallback prompts
  }

  const { text: promptText, id: promptId } = getDailyPrompt()
  const isUsingFallback = !data?.prompts || data.prompts.length === 0

  // Notify parent of selected prompt when data loads
  // Now safe from infinite loop because onPromptSelected is memoized with useCallback
  React.useEffect(() => {
    if (!isLoading && onPromptSelected) {
      onPromptSelected(promptId, promptText)
    }
  }, [promptId, promptText, isLoading, onPromptSelected])

  return (
    <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Today's Reflection Prompt
          </CardTitle>
          {isUsingFallback && (
            <Badge variant="outline" className="text-xs">
              Daily
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-medium text-foreground">
          {promptText}
        </p>
      </CardContent>
    </Card>
  )
}

