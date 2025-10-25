/**
 * API Route: Stripe Webhook Handler
 * POST /api/stripe/webhook
 * 
 * Receives Stripe webhook events and sends them to Inngest for processing
 */

import { createFileRoute } from '@tanstack/react-router'
import { verifyWebhookSignature } from '@/lib/stripe'
import { inngest } from '@/lib/inngest'

export const Route = createFileRoute('/api/stripe/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          console.log('request', request)
          // Get raw body for signature verification
          const body = await request.text()
          console.log('body', body)
          console.log('request.headers', request.headers)
          const signature = request.headers.get('stripe-signature') as string
          console.log('signature', signature)

          if (!signature) {
            console.error('No Stripe signature found')
            return new Response('Webhook signature missing', { status: 400 })
          }

          // Verify webhook signature
          const event = verifyWebhookSignature(body, signature)

          // Send event to Inngest for async processing
          await inngest.send({
            name: `stripe/${event.type}`,
            data: {
              session: event.data.object,
              paymentIntent: event.data.object,
              eventId: event.id,
              type: event.type,
            },
          })

          console.log(`✓ Stripe event ${event.type} sent to Inngest`)

          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Webhook error:', error)
          return new Response(
            `Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            { status: 400 }
          )
        }
      },
    },
  },
})

