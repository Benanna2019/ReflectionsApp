/**
 * Stripe Webhook Handler
 * 
 * Processes Stripe webhook events for payment verification
 * Verifies webhook signatures for security
 * 
 * Note: This module is kept for reference but webhook processing
 * is now handled asynchronously via Inngest functions.
 * See: src/lib/inngest/functions/stripe-payment.ts
 */

import Stripe from 'stripe'
import { env } from '@/env'
import { adminDb, tx } from '@/lib/db/backend'

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
})

export interface WebhookEvent {
  type: string
  data: any
}

/**
 * Verify Stripe webhook signature
 * 
 * @param payload - Raw request body
 * @param signature - Stripe signature header
 * @returns Verified Stripe event or throws error
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  try {
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET
    console.log('webhookSecret', webhookSecret)
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
    }
    
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw new Error('Invalid webhook signature')
  }
}

/**
 * Handle checkout.session.completed event
 * Updates user's subscription status in InstantDB
 * 
 * @param session - Stripe checkout session
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  try {
    const userId = session.client_reference_id || session.metadata?.userId

    if (!userId) {
      console.error('No user ID found in checkout session')
      throw new Error('User ID missing from session')
    }

    // Update user profile with payment info
    await adminDb.transact([
      tx.userProfiles[userId].update({
        subscriptionStatus: 'active',
        paymentId: session.id,
      }),
    ])

    console.log(`✅ Payment successful for user: ${userId}`)
  } catch (error) {
    console.error('Failed to handle checkout completed:', error)
    throw error
  }
}

/**
 * Handle payment_intent.succeeded event
 * Additional payment confirmation
 * 
 * @param paymentIntent - Stripe payment intent
 */
export async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  try {
    console.log(`💰 Payment succeeded: ${paymentIntent.id}`)
    // Additional logic if needed
  } catch (error) {
    console.error('Failed to handle payment succeeded:', error)
    throw error
  }
}

/**
 * Handle payment_intent.payment_failed event
 * Log failed payments for monitoring
 * 
 * @param paymentIntent - Stripe payment intent
 */
export async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  try {
    console.error(`❌ Payment failed: ${paymentIntent.id}`)
    // Could send notification to user or admin
  } catch (error) {
    console.error('Failed to handle payment failed:', error)
  }
}

/**
 * Main webhook handler
 * Routes events to appropriate handlers
 * 
 * @param event - Verified Stripe event
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break

    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
      break

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}

