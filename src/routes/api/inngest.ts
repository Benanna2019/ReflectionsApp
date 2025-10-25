/**
 * API Route: Inngest Serve Endpoint
 * GET/POST/PUT /api/inngest
 * 
 * Serves Inngest functions for development and production
 */

import { createFileRoute } from '@tanstack/react-router'
import { serve } from 'inngest/edge'
import { inngest } from '@/lib/inngest'
import {
  processCheckoutCompleted,
  processPaymentSucceeded,
  processPaymentFailed,
  generateReflectionPrompts,
} from '@/lib/inngest/functions'

// Create Inngest serve handler
const inngestHandler = serve({
  client: inngest,
  functions: [
    processCheckoutCompleted,
    processPaymentSucceeded,
    processPaymentFailed,
    generateReflectionPrompts,
  ]
})

export const Route = createFileRoute('/api/inngest')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return inngestHandler(request as any)
      },
      POST: async ({ request }) => {
        return inngestHandler(request as any)
      },
      PUT: async ({ request }) => {
        return inngestHandler(request as any)
      },
    },
  },
})
