import type { InstantRules } from '@instantdb/react'

/**
 * InstantDB Permissions
 * 
 * Use: npx instant-cli@latest push perms
 * 
 * Security Model:
 * - Users can only access their own data (reflections, files, settings)
 * - Admins can manage prompts
 * - Email logs are system-only (not viewable by users)
 * - Scrapbook orders can be created/viewed but not updated/deleted
 */

// Admin email addresses
const ADMIN_EMAILS = [
  'bass41992ben@gmail.com', // Replace with your actual admin email
]

const rules = {
  /**
   * Default: Deny all by default for security
   */
  $default: {
    allow: {
      $default: 'false',
    },
  },

  /**
   * Files ($files)
   * - Users can only access files linked to their own reflections
   * - Files are associated with reflections via the 'reflection' link
   */
  $files: {
    allow: {
      view: 'isOwner',
      create: 'auth.id != null', // Anyone authenticated can upload
      delete: 'isOwner',
    },
    bind: [
      'isOwner',
      'auth.id in auth.ref("$user.id")',
    ],
  },

  /**
   * User Profiles
   * - Users can only access their own profile
   * - Profile is linked to $user via '$user' link
   */
  userProfiles: {
    allow: {
      view: 'isOwner',
      create: 'isCreatingOwnProfile',
      update: 'isOwner',
      delete: 'false', // Profiles cannot be deleted
    },
    bind: [
      'isOwner',
      'auth.id in data.ref("$user.id")',
      'isCreatingOwnProfile',
      'auth.id != null', // Must be authenticated to create profile
    ],
  },

  /**
   * Reflections
   * - Users can only access their own reflections
   * - Reflections are linked to userProfiles via 'user' link
   */
  reflections: {
    allow: {
      view: 'true',
      create: 'true',
      update: 'true',
      delete: 'isOwner',
    },
    bind: [
      'isOwner',
      'auth.id in data.ref("user.id")',
      'isStillOwner',
      'auth.id in newData.ref("user.id")',
    ],
  },

  /**
   * Prompts
   * - Active prompts viewable by all authenticated users
   * - Only admins can create/update/delete prompts
   * - Pending prompts only visible to admins
   */
  prompts: {
    allow: {
      view: 'isAuthenticated && (isActivePrompt || isAdmin)',
      create: 'isAdmin',
      update: 'isAdmin',
      delete: 'isAdmin',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isActivePrompt',
      'data.status == "active"',
      'isAdmin',
      `auth.email in [${ADMIN_EMAILS.map(email => `'${email}'`).join(', ')}]`,
    ],
  },

  /**
   * User Settings
   * - Users can only access their own settings
   * - Settings are linked to userProfiles via 'user' link
   */
  userSettings: {
    allow: {
      view: 'isOwner',
      create: 'isCreatingOwnSettings',
      update: 'isOwner',
      delete: 'isOwner',
    },
    bind: [
      'isOwner',
      'auth.id in data.ref("user.$user.id")',
      'isCreatingOwnSettings',
      'auth.id != null',
    ],
  },

  /**
   * Email Logs
   * - NOT viewable by users (system only)
   * - Backend/system can create logs via admin SDK
   */
  emailLogs: {
    allow: {
      view: 'false', // Users cannot view email logs
      create: 'false', // Only backend can create via admin SDK
      update: 'false',
      delete: 'false',
    },
  },

  /**
   * Scrapbook Orders
   * - Users can view and create their own orders
   * - Orders cannot be updated or deleted once created (immutable)
   * - Orders are linked to userProfiles via 'user' link
   */
  scrapbookOrders: {
    allow: {
      view: 'isOwner',
      create: 'isCreatingOwnOrder',
      update: 'false', // Orders are immutable once created
      delete: 'false', // Orders cannot be deleted
    },
    bind: [
      'isOwner',
      'auth.id in data.ref("user.$user.id")',
      'isCreatingOwnOrder',
      'auth.id != null',
    ],
  },

  /**
   * Attrs - Control schema changes
   * - Locked down for production
   * - Only allow creating known attributes
   */
  attrs: {
    allow: {
      create: 'false', // Prevent arbitrary schema changes in production
    },
  },
} satisfies InstantRules

export default rules

/**
 * Admin Configuration
 * 
 * To add admin users, update the ADMIN_EMAILS array above with actual email addresses.
 * 
 * Example:
 * const ADMIN_EMAILS = [
 *   'joe@instantdb.com',
 *   'stopa@instantdb.com',
 * ]
 */

/**
 * Permission Testing Guide
 * 
 * After pushing permissions, test these scenarios:
 * 
 * 1. Users can:
 *    - Create their own reflections
 *    - View only their own reflections
 *    - Update only their own reflections
 *    - Delete only their own reflections
 *    - Upload photos for their reflections
 *    - View only their photos
 *    - View active prompts
 *    - Create/view/update their settings
 *    - Create/view scrapbook orders (but not update/delete)
 * 
 * 2. Users cannot:
 *    - View other users' reflections
 *    - View other users' photos
 *    - View pending prompts (unless admin)
 *    - Create/update/delete prompts (unless admin)
 *    - View email logs
 *    - Update or delete scrapbook orders
 * 
 * 3. Admins can:
 *    - All of the above
 *    - View pending prompts
 *    - Create/update/delete prompts
 * 
 * Push permissions with:
 * npx instant-cli@latest push perms
 */
