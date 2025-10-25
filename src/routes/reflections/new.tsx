import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { PhotoUpload } from '@/components/reflections/PhotoUpload'
import { ReflectionTextInput } from '@/components/reflections/ReflectionTextInput'
import { DailyPrompt } from '@/components/reflections/DailyPrompt'
import { db, tx } from '@/lib/db'
import { id } from '@instantdb/react'
import { useQuery } from '@/lib/db'

export const Route = createFileRoute('/reflections/new')({
  component: NewReflectionPage,
})

function NewReflectionPage() {
  return (
    <ProtectedRoute requirePayment>
      <NewReflectionContent />
    </ProtectedRoute>
  )
}

function NewReflectionContent() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [photoData, setPhotoData] = useState<{
    blob: Blob
    file: File
  } | null>(null)
  const [reflectionText, setReflectionText] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState<{
    id: string | null
    text: string
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Get user profile
  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useQuery(
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

  /**
   * Handle photo selection
   */
  const handlePhotoSelected = (data: {
    blob: Blob
    file: File
  }) => {
    setPhotoData(data)
    setSaveError(null)
  }

  /**
   * Handle photo removal
   */
  const handlePhotoRemoved = () => {
    setPhotoData(null)
  }

  /**
   * Handle text change
   */
  const handleTextChanged = (text: string) => {
    setReflectionText(text)
    setSaveError(null)
  }

  /**
   * Handle prompt selection
   * Memoized to prevent infinite loop in DailyPrompt's useEffect
   */
  const handlePromptSelected = useCallback((promptId: string | null, promptText: string) => {
    setSelectedPrompt({ id: promptId, text: promptText })
  }, [])

  /**
   * Save reflection to database
   */
  const handleSaveReflection = async () => {
    if (!photoData || !reflectionText) {
      setSaveError('Please add both a photo and reflection text')
      return
    }

    if (!userProfile) {
      setSaveError('User profile not found. Please try signing in again.')
      return
    }

    try {
      setIsSaving(true)
      setSaveError(null)

      // Upload photo to InstantDB storage
      console.log('Uploading photo...', photoData.file)

      // Upload file to InstantDB
      const { data: fileData } = await db.storage.uploadFile(
        `reflections/${user?.id}/${Date.now()}.jpg`,
        photoData.file
      )

      console.log('Photo uploaded:', fileData)

      // Create reflection record
      const reflectionId = id()
      console.log('Reflection ID:', reflectionId)
      const transaction = db.tx.reflections[reflectionId]
        .create({
          reflectionText: reflectionText,
          syncStatus: 'synced',
          createdAt: Date.now(),
        })
        .link({ user: userProfile.id })
        .link({ photo: fileData.id })

      console.log('Linked to user:', userProfile.id)
      console.log('Linked to photo:', fileData.id)
      console.log('Transaction:', transaction)

      // Link to prompt if available
      if (selectedPrompt?.id) {
        transaction.link({ prompt: selectedPrompt.id })
      }

      const res = await db.transact([transaction])
      console.log('Transaction result:', res)

      console.log('Reflection saved successfully!')
      setSaveSuccess(true)

      // Redirect to dashboard after success
      setTimeout(() => {
        navigate({ to: '/' })
      }, 2000)
    } catch (err) {
      console.error('Error saving reflection:', err)
      setSaveError(
        err instanceof Error ? err.message : 'Failed to save reflection. Please try again.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const canSave = photoData && reflectionText && !isSaving && !isLoadingProfile

  // Show loading state while profile loads
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    )
  }

  // Show error if profile fails to load
  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Failed to load profile. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">New Reflection</h1>
          <div className="w-20" /> {/* Spacer for center alignment */}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          {/* Success Message */}
          {saveSuccess && (
            <Alert className="bg-primary/10 border-primary">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">
                Reflection saved successfully! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {saveError && (
            <Alert variant="destructive">
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}

          {/* Daily Prompt */}
          <DailyPrompt onPromptSelected={handlePromptSelected} />

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Add a Photo</CardTitle>
              <CardDescription>
                Capture or upload a photo to remember this moment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                onPhotoSelected={handlePhotoSelected}
                onPhotoRemoved={handlePhotoRemoved}
              />
            </CardContent>
          </Card>

          {/* Reflection Text */}
          <Card>
            <CardHeader>
              <CardTitle>Write Your Reflection</CardTitle>
              <CardDescription>
                Share your thoughts, feelings, or what made today special
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReflectionTextInput onTextChanged={handleTextChanged} />
            </CardContent>
          </Card>

          {/* Save Button */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {photoData ? '✓' : '○'} Photo added
                  </span>
                  <span>
                    {reflectionText ? '✓' : '○'} Reflection written
                  </span>
                </div>
                <Button
                  onClick={handleSaveReflection}
                  disabled={!canSave}
                  size="lg"
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save Reflection
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Your reflections are saved securely.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

