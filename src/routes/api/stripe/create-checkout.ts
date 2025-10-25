/**
 * API Route: Create Stripe Checkout Session
 * POST /api/stripe/create-checkout
 */

import { createFileRoute } from '@tanstack/react-router'
import { createCheckoutSession } from '@/lib/stripe'
import { env } from '@/env'

export const Route = createFileRoute('/api/stripe/create-checkout')({
  server: {
    handlers: {
        POST: async ({ request }) => {
    try {
      const body = await request.json()
      const { userId, userEmail } = body

      // Validation
      if (!userId || !userEmail) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Create checkout session
      const session = await createCheckoutSession({
        userId,
        userEmail,
        successUrl: `${env.SERVER_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${env.SERVER_URL || 'http://localhost:3000'}/payment/cancel`,
      })

      return new Response(
        JSON.stringify(session),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Create checkout error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create checkout session' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  },
  },
}
})

