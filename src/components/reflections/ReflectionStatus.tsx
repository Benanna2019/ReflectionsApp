import { CheckCircle2, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@/lib/db'

interface ReflectionStatusProps {
  userProfileId: string
}

/**
 * ReflectionStatus Component
 * 
 * Shows if user has completed today's reflection
 * Displays completion status and streak information
 */
export function ReflectionStatus({ userProfileId }: ReflectionStatusProps) {
  // Query today's reflections
  const { data, isLoading } = useQuery({
    reflections: {
      $: {
        where: {
          'user.id': userProfileId,
        },
      },
      user: {},
    },
  })

  /**
   * Check if user has completed reflection today
   */
  const hasCompletedToday = (): boolean => {
    if (!data?.reflections) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()

    return data.reflections.some((reflection) => {
      const reflectionDate = new Date(reflection.createdAt)
      reflectionDate.setHours(0, 0, 0, 0)
      return reflectionDate.getTime() === todayTimestamp
    })
  }

  /**
   * Calculate reflection streak
   */
  const getStreak = (): number => {
    if (!data?.reflections || data.reflections.length === 0) return 0

    // Sort reflections by date (newest first)
    const sorted = [...data.reflections].sort((a, b) => b.createdAt - a.createdAt)

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const reflection of sorted) {
      const reflectionDate = new Date(reflection.createdAt)
      reflectionDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(currentDate)
      expectedDate.setDate(expectedDate.getDate() - streak)
      expectedDate.setHours(0, 0, 0, 0)

      if (reflectionDate.getTime() === expectedDate.getTime()) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  if (isLoading) {
    return null
  }

  const completedToday = hasCompletedToday()
  const streak = getStreak()

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {completedToday ? (
              <div className="rounded-full bg-primary/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <div className="rounded-full bg-muted p-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-medium">
                {completedToday ? "Today's reflection complete!" : 'No reflection yet today'}
              </p>
              <p className="text-sm text-muted-foreground">
                {data?.reflections?.length || 0} total reflections
              </p>
            </div>
          </div>
          {streak > 0 && (
            <Badge variant="secondary" className="gap-1">
              🔥 {streak} day{streak !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

