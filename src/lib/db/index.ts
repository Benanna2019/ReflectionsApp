/**
 * InstantDB Database Module
 * 
 * Exports:
 * - db: InstantDB client instance
 * - schema: Type-safe schema definition
 * - hooks: useQuery, useAuth, etc.
 * - permissions: Permission documentation
 */

export { db, useQuery, transact, useAuth, tx } from './client'
export { default as schema } from '../../../instant.schema'
export { permissions, isAdmin, ADMIN_EMAIL_DOMAIN } from './permissions'
export type { AppSchema } from '../../../instant.schema'

