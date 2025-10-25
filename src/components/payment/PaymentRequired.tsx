import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, Check, Heart } from 'lucide-react'

export function PaymentRequired() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      // Call API to create checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Failed to start checkout. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Heart className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to Reflections!</CardTitle>
          <CardDescription className="text-base">
            One-time payment for lifetime access to preserve your family memories
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">What's included:</h3>
            <ul className="space-y-2">
              {[
                'Unlimited photo uploads with end-to-end encryption',
                'AI-generated daily reflection prompts',
                'Automatic weekly email summaries',
                'Physical scrapbook delivery (additional cost)',
                'Sync across all your devices',
                'Offline access - capture moments anywhere',
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className="bg-muted rounded-lg p-6 text-center space-y-2">
            <div className="text-4xl font-bold">$49</div>
            <div className="text-sm text-muted-foreground">One-time payment • Lifetime access</div>
            <div className="text-xs text-muted-foreground">No subscriptions • No hidden fees</div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating checkout...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Proceed to Secure Checkout
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment processed by Stripe • 30-day money-back guarantee
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

