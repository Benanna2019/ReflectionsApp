import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, LogOut, Plus, Loader2 } from 'lucide-react'
import { ReflectionStatus, ReflectionCard } from '@/components/reflections'
import { useQuery } from '@/lib/db'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  // Get user profile
  const { data: profileData } = useQuery(
    user?.email
      ? {
          userProfiles: {
            $: {
              where: {
                email: user.email,
              },
            },
          },
        }
      : null
  )

  const userProfile = profileData?.userProfiles?.[0]

  // Get user's reflections
  // biome-ignore lint/correctness/noUnusedVariables: variables are used in JSX below
  const { data: reflectionsData, isLoading: isLoadingReflections } = useQuery(
    userProfile
      ? {
          reflections: {
            $: {
              where: {
                'user.id': userProfile.id,
              },
              order: {
                serverCreatedAt: 'desc' as const,
              },
            },
            photo: {},
            prompt: {},
          },
        }
      : null
  )

  console.log('Reflections data:', reflectionsData)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Reflections</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Reflection Status */}
          {userProfile && <ReflectionStatus userProfileId={userProfile.id} />}

          {/* New Reflection Button */}
          <Button
            onClick={() => navigate({ to: '/reflections/new' })}
            size="lg"
            className="w-full"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New Reflection
          </Button>

          {/* Past Reflections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Reflections</h2>
              {reflectionsData?.reflections && reflectionsData.reflections.length > 0 && (
                <Badge variant="secondary">
                  {reflectionsData.reflections.length} total
                </Badge>
              )}
            </div>

            {isLoadingReflections ? (
              <Card>
                <CardContent className="p-8 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading reflections...</p>
                </CardContent>
              </Card>
            ) : reflectionsData?.reflections && reflectionsData.reflections.length > 0 ? (
              <div className="space-y-4">
                {reflectionsData.reflections.map((reflection) => (
                  <ReflectionCard key={reflection.id} reflection={reflection} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No reflections yet. Start your journey today!
                  </p>
                  <Button
                    onClick={() => navigate({ to: '/reflections/new' })}
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Reflection
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

