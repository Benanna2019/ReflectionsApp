/**
 * Example Queries for InstantDB
 * 
 * This file demonstrates how to use the InstantDB schema
 * for common operations in the Reflections app.
 */

import { useQuery, transact, tx } from './client'

/**
 * Example 1: Get User's Reflections with Prompts
 * 
 * This query fetches all reflections for a user,
 * including the associated prompt for each reflection.
 */
export function useUserReflections(userId: string) {
  const { isLoading, error, data } = useQuery({
    reflections: {
      $: {
        where: {
          'user.id': userId,
        },
        order: {
          serverCreatedAt: 'desc', // Most recent first
        },
      },
      prompt: {}, // Include the prompt for each reflection
    },
  })

  return {
    isLoading,
    error,
    reflections: data?.reflections ?? [],
  }
}

/**
 * Example 2: Get Today's Reflection (if exists)
 */
export function useTodaysReflection(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTimestamp = today.getTime()

  const { data, isLoading, error } = useQuery({
    reflections: {
      $: {
        where: {
          'user.id': userId,
          createdAt: { $gte: todayTimestamp },
        },
        limit: 1,
      },
    },
  })

  return {
    isLoading,
    error,
    todayReflection: data?.reflections?.[0],
    hasCompletedToday: !!data?.reflections?.[0],
  }
}

/**
 * Example 3: Get Active Prompts
 * 
 * Fetches approved prompts that are ready to use
 */
export function useActivePrompts() {
  const { data, isLoading, error } = useQuery({
    prompts: {
      $: {
        where: {
          status: 'active',
        },
      },
    },
  })

  return {
    isLoading,
    error,
    prompts: data?.prompts ?? [],
  }
}

/**
 * Example 4: Get User Settings
 */
export function useUserSettings(userId: string) {
  const { data, isLoading, error } = useQuery({
    userSettings: {
      $: {
        where: {
          'user.id': userId,
        },
        limit: 1,
      },
    },
  })

  return {
    isLoading,
    error,
    settings: data?.userSettings?.[0],
  }
}

/**
 * Example 5: Get Pending Prompts (Admin Only)
 */
export function usePendingPrompts() {
  const { data, isLoading, error } = useQuery({
    prompts: {
      $: {
        where: {
          status: 'pending',
        },
        order: {
          serverCreatedAt: 'desc',
        },
      },
    },
  })

  return {
    isLoading,
    error,
    pendingPrompts: data?.prompts ?? [],
  }
}

/**
 * Example Mutations (Write Operations)
 */

/**
 * Create a new reflection
 */
export async function createReflection(data: {
  userId: string
  promptId: string
  encryptedPhotoUrl: string
  encryptedReflectionText: string
  encryptionAlgorithm: string
  encryptionIV: string
}) {
  const reflectionId = crypto.randomUUID()

  await transact([
    tx.reflections[reflectionId].update({
      encryptedPhotoUrl: data.encryptedPhotoUrl,
      encryptedReflectionText: data.encryptedReflectionText,
      syncStatus: 'synced',
      createdAt: Date.now(),
      encryptionAlgorithm: data.encryptionAlgorithm,
      encryptionIV: data.encryptionIV,
    }),
    // Link to user
    tx.reflections[reflectionId].link({ user: data.userId }),
    // Link to prompt
    tx.reflections[reflectionId].link({ prompt: data.promptId }),
  ])

  return reflectionId
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  settingsId: string,
  updates: {
    emailCadence?: 'daily' | 'weekly' | 'biweekly' | 'monthly'
    scrapbookDeliveryDate?: number
    emailSummariesEnabled?: boolean
    scrapbookRemindersEnabled?: boolean
  }
) {
  await transact([
    tx.userSettings[settingsId].update({
      ...updates,
      updatedAt: Date.now(),
    }),
  ])
}

/**
 * Approve a prompt (Admin only)
 */
export async function approvePrompt(promptId: string) {
  await transact([
    tx.prompts[promptId].update({
      status: 'active',
    }),
  ])
}

/**
 * Reject a prompt (Admin only)
 */
export async function rejectPrompt(promptId: string) {
  await transact([
    tx.prompts[promptId].update({
      status: 'rejected',
    }),
  ])
}

/**
 * Create a scrapbook order
 */
export async function createScrapbookOrder(data: {
  userId: string
  scheduledDate: number
}) {
  const orderId = crypto.randomUUID()

  await transact([
    tx.scrapbookOrders[orderId].update({
      scheduledDate: data.scheduledDate,
      orderStatus: 'pending',
      createdAt: Date.now(),
    }),
    // Link to user
    tx.scrapbookOrders[orderId].link({ user: data.userId }),
  ])

  return orderId
}

/**
 * Log an email
 */
export async function logEmail(data: {
  userId: string
  emailType: 'summary' | 'scrapbook_confirmation' | 'reminder'
  status: 'sent' | 'failed' | 'bounced'
  cadence?: string
  errorMessage?: string
}) {
  const logId = crypto.randomUUID()

  await transact([
    tx.emailLogs[logId].update({
      emailType: data.emailType,
      status: data.status,
      cadence: data.cadence,
      errorMessage: data.errorMessage,
      sentAt: Date.now(),
    }),
    // Link to user
    tx.emailLogs[logId].link({ user: data.userId }),
  ])

  return logId
}

