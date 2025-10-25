/**
 * Encryption Module
 * 
 * Client-side end-to-end encryption for photos and reflections
 * 
 * Exports:
 * - useEncryption hook for React components
 * - Core crypto functions for direct use
 * - Key storage management
 */

// React Hook
export { useEncryption } from './useEncryption'

// Core Crypto Functions
export {
  generateEncryptionKey,
  importEncryptionKey,
  encryptText,
  decryptText,
  encryptFile,
  decryptFile,
  isWebCryptoAvailable,
  type EncryptedData,
  type EncryptionKey,
} from './crypto'

// Key Storage
export {
  generateAndStoreKey,
  getStoredKey,
  getOrCreateKey,
  exportKeyForBackup,
  importKeyFromBackup,
  deleteKey,
  hasStoredKey,
  getKeyMetadata,
  type KeyMetadata,
  type StoredKey,
} from './keyStorage'

