import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/payment/cancel')({
  component: PaymentCancelPage,
})

function PaymentCancelPage() {
  return (
    <ProtectedRoute>
      <PaymentCancelContent />
    </ProtectedRoute>
  )
}

function PaymentCancelContent() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Payment Cancelled</CardTitle>
          <CardDescription>
            No worries! Your payment was cancelled and you haven't been charged.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
            <p>Changed your mind? You can try again anytime.</p>
            <p className="mt-2">
              If you had any issues with the checkout process, please let us know.
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={() => navigate({ to: '/payment' })} className="w-full">
              Try Payment Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/auth/sign-in' })}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

