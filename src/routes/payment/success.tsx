import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, Heart } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { useQuery } from '@/lib/db'

export const Route = createFileRoute('/payment/success')({
  component: PaymentSuccessPage,
})

function PaymentSuccessPage() {
  return (
    <ProtectedRoute>
      <PaymentSuccessContent />
    </ProtectedRoute>
  )
}

function PaymentSuccessContent() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/payment/success' }) as { session_id?: string }
  const { user } = useAuth()

  // Query user profile to check subscription status
  // useQuery provides isLoading state - no need for separate useState!
  const { data, isLoading } = useQuery(
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

  const userProfile = data?.userProfiles?.[0]
  const isSubscriptionActive = userProfile?.subscriptionStatus === 'active'

  useEffect(() => {
    // Automatically redirect to dashboard when subscription becomes active
    if (!isLoading && isSubscriptionActive) {
      const redirectTimer = setTimeout(() => {
        navigate({ to: '/dashboard' })
      }, 3000) // Show success message for 3 seconds before redirecting

      return () => clearTimeout(redirectTimer)
    }
  }, [isLoading, isSubscriptionActive, navigate])

  // Show loading state while checking subscription status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <CardTitle>Verifying Payment...</CardTitle>
            <CardDescription>
              Please wait while we confirm your payment
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Payment Successful!</CardTitle>
          <CardDescription>
            Welcome to Reflections! Your lifetime access is now active.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-medium">Lifetime Access</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">$49.00</span>
            </div>
            {search.session_id && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Session:</span>
                <span className="font-mono text-muted-foreground truncate ml-2">
                  {search.session_id.slice(0, 20)}...
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✨ A confirmation email has been sent to your inbox</p>
            <p>💾 Your data is encrypted and secure</p>
            <p>📱 Start capturing memories on any device</p>
            {isSubscriptionActive && (
              <p className="text-primary font-medium">🚀 Redirecting to dashboard in 3 seconds...</p>
            )}
          </div>

          <Button onClick={() => navigate({ to: '/dashboard' })} className="w-full" size="lg">
            <Heart className="mr-2 h-5 w-5" />
            {isSubscriptionActive ? 'Go to Dashboard Now' : 'Start Capturing Memories'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

