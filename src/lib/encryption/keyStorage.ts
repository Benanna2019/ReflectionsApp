/**
 * Encryption Key Storage Service
 * 
 * Manages encryption keys in LocalStorage
 * Keys are never sent to the server
 * 
 * Storage Structure:
 * - `reflections_encryption_key_${userId}` - User's encryption key (base64)
 * - `reflections_key_metadata_${userId}` - Key metadata (created date, version)
 */

import { generateEncryptionKey, importEncryptionKey, type EncryptionKey } from './crypto'

const KEY_PREFIX = 'reflections_encryption_key_'
const METADATA_PREFIX = 'reflections_key_metadata_'
const KEY_VERSION = '1.0'

export interface KeyMetadata {
  version: string
  createdAt: number // Unix timestamp
  algorithm: string
  userId: string
}

export interface StoredKey {
  key: CryptoKey
  metadata: KeyMetadata
}

/**
 * Generate and store a new encryption key for a user
 * 
 * @param userId - User ID
 * @returns Promise<StoredKey> - The generated key and metadata
 */
export async function generateAndStoreKey(userId: string): Promise<StoredKey> {
  try {
    // Generate new key
    const { key, keyData } = await generateEncryptionKey()

    // Create metadata
    const metadata: KeyMetadata = {
      version: KEY_VERSION,
      createdAt: Date.now(),
      algorithm: 'AES-256-GCM',
      userId,
    }

    // Store in LocalStorage
    localStorage.setItem(KEY_PREFIX + userId, keyData)
    localStorage.setItem(METADATA_PREFIX + userId, JSON.stringify(metadata))

    return { key, metadata }
  } catch (error) {
    console.error('Failed to generate and store key:', error)
    throw new Error('Failed to generate encryption key')
  }
}

/**
 * Retrieve a user's encryption key from LocalStorage
 * 
 * @param userId - User ID
 * @returns Promise<StoredKey | null> - The key and metadata, or null if not found
 */
export async function getStoredKey(userId: string): Promise<StoredKey | null> {
  try {
    const keyData = localStorage.getItem(KEY_PREFIX + userId)
    const metadataStr = localStorage.getItem(METADATA_PREFIX + userId)

    if (!keyData || !metadataStr) {
      return null
    }

    const metadata: KeyMetadata = JSON.parse(metadataStr)
    const key = await importEncryptionKey(keyData)

    return { key, metadata }
  } catch (error) {
    console.error('Failed to retrieve stored key:', error)
    throw new Error('Failed to retrieve encryption key')
  }
}

/**
 * Get or create encryption key for a user
 * If key doesn't exist, generates a new one
 * 
 * @param userId - User ID
 * @returns Promise<StoredKey> - The key and metadata
 */
export async function getOrCreateKey(userId: string): Promise<StoredKey> {
  // Try to get existing key
  const existingKey = await getStoredKey(userId)
  if (existingKey) {
    return existingKey
  }

  // Generate new key if none exists
  console.log(`Generating new encryption key for user: ${userId}`)
  return await generateAndStoreKey(userId)
}

/**
 * Export encryption key for backup/migration
 * Returns the key data as a base64 string with metadata
 * 
 * @param userId - User ID
 * @returns Promise<string> - Base64 encoded key bundle
 */
export async function exportKeyForBackup(userId: string): Promise<string> {
  try {
    const keyData = localStorage.getItem(KEY_PREFIX + userId)
    const metadataStr = localStorage.getItem(METADATA_PREFIX + userId)

    if (!keyData || !metadataStr) {
      throw new Error('No encryption key found for this user')
    }

    const metadata: KeyMetadata = JSON.parse(metadataStr)

    // Create a backup bundle
    const backup = {
      version: metadata.version,
      keyData,
      metadata,
      exportedAt: Date.now(),
    }

    // Encode as base64 for easy copying
    return btoa(JSON.stringify(backup))
  } catch (error) {
    console.error('Failed to export key:', error)
    throw new Error('Failed to export encryption key')
  }
}

/**
 * Import encryption key from backup
 * Used for device migration
 * 
 * @param userId - User ID
 * @param backupData - Base64 encoded backup bundle
 * @returns Promise<StoredKey> - The imported key and metadata
 */
export async function importKeyFromBackup(
  userId: string,
  backupData: string
): Promise<StoredKey> {
  try {
    // Decode the backup bundle
    const backupStr = atob(backupData)
    const backup = JSON.parse(backupStr)

    // Validate backup structure
    if (!backup.keyData || !backup.metadata) {
      throw new Error('Invalid backup data')
    }

    // Import the key to verify it's valid
    const key = await importEncryptionKey(backup.keyData)

    // Update metadata with current userId
    const metadata: KeyMetadata = {
      ...backup.metadata,
      userId, // Use current userId
    }

    // Store in LocalStorage
    localStorage.setItem(KEY_PREFIX + userId, backup.keyData)
    localStorage.setItem(METADATA_PREFIX + userId, JSON.stringify(metadata))

    console.log(`Imported encryption key for user: ${userId}`)
    return { key, metadata }
  } catch (error) {
    console.error('Failed to import key:', error)
    throw new Error('Failed to import encryption key. The backup may be corrupted.')
  }
}

/**
 * Delete encryption key for a user
 * WARNING: This will make all encrypted data unrecoverable
 * 
 * @param userId - User ID
 */
export function deleteKey(userId: string): void {
  localStorage.removeItem(KEY_PREFIX + userId)
  localStorage.removeItem(METADATA_PREFIX + userId)
  console.warn(`Deleted encryption key for user: ${userId}`)
}

/**
 * Check if a user has an encryption key stored
 * 
 * @param userId - User ID
 * @returns boolean - True if key exists
 */
export function hasStoredKey(userId: string): boolean {
  return localStorage.getItem(KEY_PREFIX + userId) !== null
}

/**
 * Get key metadata without loading the full key
 * 
 * @param userId - User ID
 * @returns KeyMetadata | null - Metadata or null if not found
 */
export function getKeyMetadata(userId: string): KeyMetadata | null {
  const metadataStr = localStorage.getItem(METADATA_PREFIX + userId)
  if (!metadataStr) {
    return null
  }

  try {
    return JSON.parse(metadataStr)
  } catch {
    return null
  }
}

