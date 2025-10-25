import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Mail, Loader2 } from 'lucide-react'

interface SignInFormProps {
  onCodeSent?: (email: string) => void
}

export function SignInForm({ onCodeSent }: SignInFormProps) {
  const { sendMagicCode } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await sendMagicCode(email)
      onCodeSent?.(email)
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to send code. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold">Welcome to Reflections</CardTitle>
        <CardDescription>
          Enter your email to sign in or create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending code...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Continue with Email
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            We'll send you a 6-digit code to sign in securely
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

