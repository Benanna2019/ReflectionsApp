import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PaymentRequired } from '@/components/payment/PaymentRequired'

export const Route = createFileRoute('/payment')({
  component: PaymentPage,
})

function PaymentPage() {
  return (
    <ProtectedRoute>
      <PaymentRequired />
    </ProtectedRoute>
  )
}

