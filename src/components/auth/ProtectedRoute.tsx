import { type ReactNode } from 'react'
import { Navigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  /**
   * Optional: Require payment to access this route
   * If true, will redirect users without active subscription to payment page
   */
  requirePayment?: boolean
}

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication.
 * Shows loading state while checking auth.
 * Redirects to sign-in if not authenticated.
 * Optionally redirects to payment if subscription required.
 */
export function ProtectedRoute({ children, requirePayment = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return <Navigate to="/auth/sign-in" />
  }

  // TODO: Add payment check when payment system is implemented
  // if (requirePayment && user.subscriptionStatus !== 'active') {
  //   return <Navigate to="/payment" />
  // }

  return <>{children}</>
}

