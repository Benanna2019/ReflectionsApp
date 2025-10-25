import { init } from '@instantdb/react'
import schema from '../../../instant.schema'
import { env } from '@/env'

/**
 * InstantDB Client Instance
 * 
 * Configured with:
 * - Custom schema for type-safe queries
 * - Real-time sync and offline support
 * - Built-in file storage ($files)
 * - End-to-end encryption handled client-side (not by InstantDB)
 */

export const db = init({
  appId: env.VITE_INSTANTDB_APP_ID,
  schema,
  devtool: {
    position: 'top-right',
  }
})

/**
 * Type-safe hooks and queries
 * Use these throughout the app for database operations
 */
export const { useQuery, transact, useAuth, tx } = db

/**
 * Example usage:
 * 
 * // Query user's reflections
 * const { isLoading, error, data } = useQuery({
 *   reflections: {
 *     $: {
 *       where: {
 *         'user.id': userId
 *       }
 *     },
 *     prompt: {}
 *   }
 * })
 * 
 * // Create a new reflection
 * transact([
 *   tx.reflections[reflectionId].update({
 *     encryptedPhotoUrl: '...',
 *     encryptedReflectionText: '...',
 *     syncStatus: 'synced',
 *     createdAt: Date.now(),
 *   })
 * ])
 */

