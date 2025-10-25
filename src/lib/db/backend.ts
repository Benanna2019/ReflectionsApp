/**
 * InstantDB Backend Client
 * 
 * Admin SDK for server-side database operations
 * Use this in API routes, Inngest functions, and other backend code
 */

import { init, tx, id } from '@instantdb/admin'
import { env } from '@/env'
import schema from '../../../instant.schema'

// Initialize InstantDB Admin client
export const adminDb = init({
  appId: env.VITE_INSTANTDB_APP_ID,
  adminToken: env.INSTANT_APP_ADMIN_TOKEN,
  schema,
})

// Re-export utilities for convenience
export { tx, id }
export type { TransactionChunk } from '@instantdb/admin'

