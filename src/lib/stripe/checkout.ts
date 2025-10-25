/**
 * Stripe Checkout Service
 * 
 * Handles creation of Stripe checkout sessions for one-time payments
 */

import Stripe from 'stripe'
import { env } from '@/env'

// Initialize Stripe with secret key
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

export interface CreateCheckoutSessionParams {
  userId: string
  userEmail: string
  successUrl: string
  cancelUrl: string
}

export interface CheckoutSession {
  sessionId: string
  url: string
}

/**
 * Create a Stripe checkout session for one-time payment
 * 
 * @param params - User info and redirect URLs
 * @returns CheckoutSession with ID and URL
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSession> {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // One-time payment
      customer_email: params.userEmail,
      client_reference_id: params.userId, // Store user ID for webhook
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Reflections - Lifetime Access',
              description: 'One-time payment for lifetime access to the Reflections app',
              images: [
                // Add your product image URL here
                'https://via.placeholder.com/300x300.png?text=Reflections',
              ],
            },
            unit_amount: 4900, // $49.00 in cents
          },
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
      },
    })

    if (!session.url) {
      throw new Error('Failed to create checkout session URL')
    }

    return {
      sessionId: session.id,
      url: session.url,
    }
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    throw new Error('Failed to create checkout session')
  }
}

/**
 * Retrieve a checkout session by ID
 * 
 * @param sessionId - Stripe session ID
 * @returns Stripe checkout session
 */
export async function getCheckoutSession(sessionId: string) {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId)
  } catch (error) {
    console.error('Failed to retrieve checkout session:', error)
    throw new Error('Failed to retrieve checkout session')
  }
}

/**
 * Check if a session has been paid
 * 
 * @param sessionId - Stripe session ID
 * @returns boolean indicating payment status
 */
export async function isSessionPaid(sessionId: string): Promise<boolean> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return session.payment_status === 'paid'
  } catch (error) {
    console.error('Failed to check session payment status:', error)
    return false
  }
}

