import { i } from '@instantdb/react'

/**
 * Reflections App - InstantDB Schema
 * 
 * This schema defines the data structure for the automated scrapbooking application.
 * All photos and reflections are encrypted client-side before storage.
 */

export const schema = i.schema({
  entities: {
    /**
     * User Profiles
     * Stores basic user information and subscription status
     */
    userProfiles: i.entity({
      email: i.string(),
      name: i.string(),
      subscriptionStatus: i.string(), // 'active' | 'inactive'
      paymentId: i.string(),
      encryptionKeyId: i.string(), // Reference to key metadata (not the actual key)
      createdAt: i.number(), // Unix timestamp
    }),

    /**
     * Reflections (Encrypted)
     * Daily photo + reflection entries. All content is encrypted client-side.
     */
    reflections: i.entity({
      encryptedPhotoUrl: i.string(), // URL to encrypted photo blob
      encryptedReflectionText: i.string(), // Encrypted reflection text
      syncStatus: i.string(), // 'synced' | 'pending' | 'failed'
      createdAt: i.number(), // Unix timestamp
      // Encryption metadata stored as JSON string
      encryptionAlgorithm: i.string(), // e.g., 'AES-256-GCM'
      encryptionIV: i.string(), // Initialization vector for decryption
    }),

    /**
     * Prompts
     * Daily reflection prompts. AI-generated and admin-curated.
     */
    prompts: i.entity({
      promptText: i.string(),
      status: i.string(), // 'pending' | 'active' | 'rejected'
      category: i.string(), // e.g., 'gratitude', 'milestone', 'everyday'
      createdBy: i.string(), // 'ai' | 'admin'
      createdAt: i.number(), // Unix timestamp
    }),

    /**
     * User Settings
     * Preferences for email cadence and scrapbook delivery
     */
    userSettings: i.entity({
      emailCadence: i.string(), // 'daily' | 'weekly' | 'biweekly' | 'monthly'
      scrapbookDeliveryDate: i.number(), // Unix timestamp for future delivery date
      emailSummariesEnabled: i.boolean(),
      scrapbookRemindersEnabled: i.boolean(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    /**
     * Email Logs
     * Track all emails sent to users
     */
    emailLogs: i.entity({
      emailType: i.string(), // 'summary' | 'scrapbook_confirmation' | 'reminder'
      status: i.string(), // 'sent' | 'failed' | 'bounced'
      cadence: i.string().optional(), // For summary emails
      sentAt: i.number(), // Unix timestamp
      errorMessage: i.string().optional(),
    }),

    /**
     * Scrapbook Orders
     * Track scrapbook compilation and printing orders
     */
    scrapbookOrders: i.entity({
      scheduledDate: i.number(), // Unix timestamp when scrapbook should be compiled
      orderStatus: i.string(), // 'pending' | 'processing' | 'submitted' | 'completed'
      externalOrderId: i.string().optional(), // Chatbooks/Adobe order ID
      createdAt: i.number(),
      completedAt: i.number().optional(),
    }),
  },

  links: {
    /**
     * Link: User -> Reflections (one-to-many)
     * A user can have many reflections
     */
    userReflections: {
      forward: { on: 'reflections', has: 'one', label: 'user' },
      reverse: { on: 'userProfiles', has: 'many', label: 'reflections' },
    },

    /**
     * Link: User -> Settings (one-to-one)
     * Each user has one settings object
     */
    userSettings: {
      forward: { on: 'userSettings', has: 'one', label: 'user' },
      reverse: { on: 'userProfiles', has: 'one', label: 'settings' },
    },

    /**
     * Link: Reflection -> Prompt (many-to-one)
     * Each reflection is associated with a prompt
     */
    reflectionPrompt: {
      forward: { on: 'reflections', has: 'one', label: 'prompt' },
      reverse: { on: 'prompts', has: 'many', label: 'reflections' },
    },

    /**
     * Link: User -> Email Logs (one-to-many)
     * A user can have many email log entries
     */
    userEmailLogs: {
      forward: { on: 'emailLogs', has: 'one', label: 'user' },
      reverse: { on: 'userProfiles', has: 'many', label: 'emailLogs' },
    },

    /**
     * Link: User -> Scrapbook Orders (one-to-many)
     * A user can have multiple scrapbook orders over time
     */
    userScrapbookOrders: {
      forward: { on: 'scrapbookOrders', has: 'one', label: 'user' },
      reverse: { on: 'userProfiles', has: 'many', label: 'scrapbookOrders' },
    },
  },
})

// Type exports for use throughout the app
export type Schema = typeof schema

