import { i } from '@instantdb/react'

/**
 * Reflections App - InstantDB Schema
 * 
 * This schema is used by the InstantDB CLI to push schema changes.
 * Use: npx instant-cli@latest push schema
 */

const _schema = i.schema({
  entities: {
    /**
     * System entity: Files
     * InstantDB's built-in storage system
     */
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),

    /**
     * System entity: Users
     * InstantDB's built-in auth system
     */
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),

    /**
     * User Profiles
     * Extended user information
     */
    userProfiles: i.entity({
      email: i.string().optional(),
      name: i.string().optional(),
      subscriptionStatus: i.string().optional(), // 'active' | 'inactive'
      paymentId: i.string().optional(),
      encryptionKeyId: i.string().optional(), // Reference to encryption key metadata
      createdAt: i.number().optional(), // Unix timestamp
    }),

    /**
     * Reflections
     * Daily photo + reflection entries
     */
    reflections: i.entity({
      reflectionText: i.string(), // Reflection text
      syncStatus: i.string(), // 'synced' | 'pending' | 'failed'
      createdAt: i.number().indexed(), // Unix timestamp, indexed for sorting
    }),

    /**
     * Prompts
     * AI-generated, admin-curated reflection prompts
     */
    prompts: i.entity({
      promptText: i.string(),
      status: i.string().indexed(), // 'pending' | 'active' | 'rejected' - indexed for filtering
      category: i.string(),
      createdBy: i.string(), // 'ai' | 'admin'
      createdAt: i.number(),
    }),

    /**
     * User Settings
     * User preferences
     */
    userSettings: i.entity({
      emailCadence: i.string(), // 'daily' | 'weekly' | 'biweekly' | 'monthly'
      scrapbookDeliveryDate: i.number(), // Unix timestamp
      emailSummariesEnabled: i.boolean(),
      scrapbookRemindersEnabled: i.boolean(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    /**
     * Email Logs
     * Track emails sent
     */
    emailLogs: i.entity({
      emailType: i.string(), // 'summary' | 'scrapbook_confirmation' | 'reminder'
      status: i.string(), // 'sent' | 'failed' | 'bounced'
      cadence: i.string().optional(),
      sentAt: i.number(),
      errorMessage: i.string().optional(),
    }),

    /**
     * Scrapbook Orders
     * Track scrapbook orders
     */
    scrapbookOrders: i.entity({
      scheduledDate: i.number(),
      orderStatus: i.string(), // 'pending' | 'processing' | 'submitted' | 'completed'
      externalOrderId: i.string().optional(),
      createdAt: i.number(),
      completedAt: i.number().optional(),
    }),
  },

  links: {
    /**
     * Link: UserProfile <-> $user (one-to-one)
     * Connect InstantDB auth user to profile
     */
    profile$user: {
      forward: {
        on: 'userProfiles',
        has: 'one',
        label: '$user',
      },
      reverse: {
        on: '$users',
        has: 'one',
        label: 'profile',
      },
    },

    /**
     * Link: Reflection <-> Photo File (one-to-one)
     * Each reflection has one encrypted photo
     */
    reflectionPhoto: {
      forward: {
        on: 'reflections',
        has: 'one',
        label: 'photo',
      },
      reverse: {
        on: '$files',
        has: 'one',
        label: 'reflection',
      },
    },

    /**
     * Link: Reflection <-> UserProfile (many-to-one)
     * User can have many reflections
     */
    reflectionUser: {
      forward: {
        on: 'reflections',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: 'userProfiles',
        has: 'many',
        label: 'reflections',
      },
    },

    /**
     * Link: Reflection <-> Prompt (many-to-one)
     * Each reflection associated with one prompt
     */
    reflectionPrompt: {
      forward: {
        on: 'reflections',
        has: 'one',
        label: 'prompt',
      },
      reverse: {
        on: 'prompts',
        has: 'many',
        label: 'reflections',
      },
    },

    /**
     * Link: UserSettings <-> UserProfile (one-to-one)
     * Each user has one settings object
     */
    settingsUser: {
      forward: {
        on: 'userSettings',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: 'userProfiles',
        has: 'one',
        label: 'settings',
      },
    },

    /**
     * Link: EmailLog <-> UserProfile (many-to-one)
     * User can have many email logs
     */
    emailLogUser: {
      forward: {
        on: 'emailLogs',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: 'userProfiles',
        has: 'many',
        label: 'emailLogs',
      },
    },

    /**
     * Link: ScrapbookOrder <-> UserProfile (many-to-one)
     * User can have many orders
     */
    scrapbookOrderUser: {
      forward: {
        on: 'scrapbookOrders',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: 'userProfiles',
        has: 'many',
        label: 'scrapbookOrders',
      },
    },
  },

  rooms: {},
})

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema

export type { AppSchema }
export default schema

