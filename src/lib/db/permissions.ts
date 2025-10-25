/**
 * InstantDB Permissions Configuration
 * 
 * These permissions are defined using CEL (Common Expression Language)
 * and should be configured in the InstantDB Dashboard.
 * 
 * This file serves as documentation of the permissions structure.
 */

export const permissions = {
  /**
   * User Profiles
   * - Users can read their own profile
   * - Users can update their own profile
   * - Admins can read all profiles
   */
  userProfiles: {
    allow: {
      view: "auth.id == data.id",
      create: "auth.id == data.id",
      update: "auth.id == data.id",
      delete: "false", // Profiles cannot be deleted directly
    },
  },

  /**
   * Reflections (Encrypted)
   * - Users can only access their own reflections
   * - All content is encrypted client-side
   */
  reflections: {
    allow: {
      view: "auth.id in data.ref('user.id')",
      create: "auth.id in data.ref('user.id')",
      update: "auth.id in data.ref('user.id')",
      delete: "auth.id in data.ref('user.id')",
    },
  },

  /**
   * Prompts
   * - Anyone can view active prompts
   * - Only admins can create/update prompts
   * - Pending prompts are only visible to admins
   */
  prompts: {
    allow: {
      view: "data.status == 'active' || auth.email.endsWith('@admin.reflections.app')",
      create: "auth.email.endsWith('@admin.reflections.app')",
      update: "auth.email.endsWith('@admin.reflections.app')",
      delete: "auth.email.endsWith('@admin.reflections.app')",
    },
  },

  /**
   * User Settings
   * - Users can only access and modify their own settings
   */
  userSettings: {
    allow: {
      view: "auth.id in data.ref('user.id')",
      create: "auth.id in data.ref('user.id')",
      update: "auth.id in data.ref('user.id')",
      delete: "auth.id in data.ref('user.id')",
    },
  },

  /**
   * Email Logs
   * - Users can view their own email logs (read-only)
   * - System can create email logs
   */
  emailLogs: {
    allow: {
      view: "auth.id in data.ref('user.id')",
      create: "true", // System creates these via server-side
      update: "false",
      delete: "false",
    },
  },

  /**
   * Scrapbook Orders
   * - Users can view their own orders
   * - Users can create orders
   * - System updates order status
   */
  scrapbookOrders: {
    allow: {
      view: "auth.id in data.ref('user.id')",
      create: "auth.id in data.ref('user.id')",
      update: "auth.id in data.ref('user.id')", // Allow status updates
      delete: "false",
    },
  },
}

/**
 * Setup Instructions:
 * 
 * 1. Go to your InstantDB Dashboard: https://instantdb.com/dash
 * 2. Select your app
 * 3. Navigate to "Permissions"
 * 4. For each entity, add the CEL expressions above
 * 
 * Example for 'reflections':
 * - View: auth.id in data.ref('user.id')
 * - Create: auth.id in data.ref('user.id')
 * - Update: auth.id in data.ref('user.id')
 * - Delete: auth.id in data.ref('user.id')
 * 
 * Admin Email Pattern:
 * To set admin permissions, update the email pattern to match your admin domain:
 * - Example: auth.email.endsWith('@yourdomain.com')
 * - Or use a specific admin ID check: auth.id == 'admin-user-id-here'
 */

export const ADMIN_EMAIL_DOMAIN = '@admin.reflections.app'

/**
 * Helper function to check if current user is admin (client-side)
 * Note: This is just for UI purposes. Real security is enforced by InstantDB permissions.
 */
export function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  return email.endsWith(ADMIN_EMAIL_DOMAIN)
}

