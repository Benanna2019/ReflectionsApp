/**
 * Inngest Functions: Stripe Payment Processing
 * 
 * Handles Stripe webhook events asynchronously
 */

import { inngest } from '../client'
import { adminDb, tx } from '@/lib/db/backend'
import type Stripe from 'stripe'

/**
 * Process checkout.session.completed event
 * Updates user subscription status when payment succeeds
 */
export const processCheckoutCompleted = inngest.createFunction(
  {
    id: 'stripe/checkout-completed',
    name: 'Process Stripe Checkout Completed',
    retries: 3,
  },
  { event: 'stripe/checkout.session.completed' },
  async ({ event, step }) => {
    const session = event.data.session as Stripe.Checkout.Session

    // Step 1: Validate session data
    const userId = await step.run('validate-session', async () => {
      const userId = session.client_reference_id || session.metadata?.userId

      if (!userId) {
        throw new Error('No user ID found in checkout session')
      }

      return userId
    })

    // query the user to spread in the transaction below

    const { $users } = await adminDb.query({
      $users: {
        $: {
          where: {
            id: userId,
          },
        },
      },
    })

    const { userProfiles } = await adminDb.query({
      userProfiles: {
        $: {
          where: {
            email: $users?.[0].email,
          },
        },
      },
    })

    // Step 2: Update user subscription in InstantDB
    await step.run('update-user-subscription', async () => {
      await adminDb.transact([
        tx.userProfiles[userProfiles?.[0].id].update({
          subscriptionStatus: 'active',
          paymentId: session.id,
        }),
      ])

      return { userId, sessionId: session.id }
    })

    // Step 3: Log success
    await step.run('log-payment-success', async () => {
      console.log(`✅ Payment successful for user: ${userId}`)
      console.log(`   Session ID: ${session.id}`)
      console.log(`   Amount: $${(session.amount_total ?? 0) / 100}`)

      return { success: true }
    })

    return { userId, sessionId: session.id, status: 'completed' }
  }
)

/**
 * Process payment_intent.succeeded event
 * Additional payment confirmation and logging
 */
export const processPaymentSucceeded = inngest.createFunction(
  {
    id: 'stripe/payment-succeeded',
    name: 'Process Stripe Payment Succeeded',
  },
  { event: 'stripe/payment_intent.succeeded' },
  async ({ event, step }) => {
    const paymentIntent = event.data.paymentIntent as Stripe.PaymentIntent

    await step.run('log-payment-intent', async () => {
      console.log(`💰 Payment succeeded: ${paymentIntent.id}`)
      console.log(`   Amount: $${paymentIntent.amount / 100}`)
      console.log(`   Status: ${paymentIntent.status}`)

      // Add any additional business logic here
      // For example: send confirmation email, update analytics, etc.

      return { paymentIntentId: paymentIntent.id }
    })

    return { paymentIntentId: paymentIntent.id, status: 'logged' }
  }
)

/**
 * Process payment_intent.payment_failed event
 * Log and handle failed payments
 */
export const processPaymentFailed = inngest.createFunction(
  {
    id: 'stripe/payment-failed',
    name: 'Process Stripe Payment Failed',
  },
  { event: 'stripe/payment_intent.payment_failed' },
  async ({ event, step }) => {
    const paymentIntent = event.data.paymentIntent as Stripe.PaymentIntent

    await step.run('handle-payment-failure', async () => {
      console.error(`❌ Payment failed: ${paymentIntent.id}`)
      console.error(`   Reason: ${paymentIntent.last_payment_error?.message || 'Unknown'}`)

      // Add failure handling logic here
      // For example: send notification to user, alert admin, etc.

      return { paymentIntentId: paymentIntent.id, failed: true }
    })

    return { paymentIntentId: paymentIntent.id, status: 'failed' }
  }
)

