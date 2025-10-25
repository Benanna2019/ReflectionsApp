import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { SignInForm } from '@/components/auth/SignInForm'
import { CodeVerificationForm } from '@/components/auth/CodeVerificationForm'
import { useAuth } from '@/lib/auth/AuthProvider'

export const Route = createFileRoute('/auth/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [email, setEmail] = useState<string | null>(null)

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user) {
      navigate({ to: '/dashboard' })
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {email ? (
        <CodeVerificationForm
          email={email}
          onBack={() => setEmail(null)}
        />
      ) : (
        <SignInForm onCodeSent={setEmail} />
      )}
    </div>
  )
}

