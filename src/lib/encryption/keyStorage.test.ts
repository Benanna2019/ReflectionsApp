import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest'
import {
  generateAndStoreKey,
  getStoredKey,
  getOrCreateKey,
  exportKeyForBackup,
  importKeyFromBackup,
  deleteKey,
  hasStoredKey,
  getKeyMetadata,
} from './keyStorage'
import { encryptText, decryptText } from './crypto'

// Mock LocalStorage for Node.js test environment
class LocalStorageMock {
  private store: Record<string, string> = {}

  get length() {
    return Object.keys(this.store).length
  }

  clear() {
    this.store = {}
  }

  getItem(key: string) {
    return this.store[key] || null
  }

  setItem(key: string, value: string) {
    this.store[key] = value
  }

  removeItem(key: string) {
    delete this.store[key]
  }

  key(index: number) {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }
}

describe('Key Storage Service', () => {
  const testUserId = 'test-user-123'
  const testUserId2 = 'test-user-456'

  // Set up LocalStorage mock
  beforeAll(() => {
    global.localStorage = new LocalStorageMock() as Storage
  })

  // Clean up LocalStorage before and after each test
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Key Generation and Storage', () => {
    it('should generate and store a key', async () => {
      const { key, metadata } = await generateAndStoreKey(testUserId)

      expect(key).toBeDefined()
      expect(key.type).toBe('secret')
      expect(metadata).toBeDefined()
      expect(metadata.userId).toBe(testUserId)
      expect(metadata.algorithm).toBe('AES-256-GCM')
      expect(metadata.version).toBeDefined()
      expect(metadata.createdAt).toBeGreaterThan(0)
    })

    it('should store key in LocalStorage', async () => {
      await generateAndStoreKey(testUserId)

      const keyData = localStorage.getItem(`reflections_encryption_key_${testUserId}`)
      const metadataStr = localStorage.getItem(`reflections_key_metadata_${testUserId}`)

      expect(keyData).toBeDefined()
      expect(metadataStr).toBeDefined()
    })

    it('should store separate keys for different users', async () => {
      const { key: key1 } = await generateAndStoreKey(testUserId)
      const { key: key2 } = await generateAndStoreKey(testUserId2)

      // Export keys to compare (as base64 strings)
      const exported1 = await crypto.subtle.exportKey('raw', key1)
      const exported2 = await crypto.subtle.exportKey('raw', key2)

      // Convert to base64 for comparison
      const bytes1 = new Uint8Array(exported1)
      const bytes2 = new Uint8Array(exported2)
      const base64_1 = Buffer.from(bytes1).toString('base64')
      const base64_2 = Buffer.from(bytes2).toString('base64')

      expect(base64_1).not.toBe(base64_2)
    })
  })

  describe('Key Retrieval', () => {
    it('should retrieve a stored key', async () => {
      // Store a key
      const { metadata: originalMetadata } = await generateAndStoreKey(testUserId)

      // Retrieve it
      const retrieved = await getStoredKey(testUserId)

      expect(retrieved).not.toBeNull()
      expect(retrieved?.key).toBeDefined()
      expect(retrieved?.metadata.userId).toBe(originalMetadata.userId)
      expect(retrieved?.metadata.createdAt).toBe(originalMetadata.createdAt)
    })

    it('should return null for non-existent key', async () => {
      const retrieved = await getStoredKey('non-existent-user')

      expect(retrieved).toBeNull()
    })

    it('should retrieve functional key', async () => {
      // Store a key
      const { key: originalKey } = await generateAndStoreKey(testUserId)

      // Retrieve it
      const retrieved = await getStoredKey(testUserId)
      expect(retrieved).not.toBeNull()

      // Test that it works for encryption
      const testText = 'Test message'
      const encrypted = await encryptText(testText, originalKey)
      const decrypted = await decryptText(encrypted, retrieved!.key)

      expect(decrypted).toBe(testText)
    })
  })

  describe('Get or Create Key', () => {
    it('should create key if none exists', async () => {
      expect(hasStoredKey(testUserId)).toBe(false)

      const { key, metadata } = await getOrCreateKey(testUserId)

      expect(key).toBeDefined()
      expect(metadata.userId).toBe(testUserId)
      expect(hasStoredKey(testUserId)).toBe(true)
    })

    it('should return existing key if one exists', async () => {
      // Create initial key
      const { metadata: original } = await generateAndStoreKey(testUserId)

      // Get or create should return the same key
      const { metadata: retrieved } = await getOrCreateKey(testUserId)

      expect(retrieved.createdAt).toBe(original.createdAt)
      expect(retrieved.userId).toBe(original.userId)
    })

    it('should not create duplicate keys', async () => {
      const { metadata: first } = await getOrCreateKey(testUserId)
      const { metadata: second } = await getOrCreateKey(testUserId)

      // Should be the same key (same creation time)
      expect(first.createdAt).toBe(second.createdAt)
      expect(hasStoredKey(testUserId)).toBe(true)

      // Verify only one key/metadata pair in localStorage
      const keyData = localStorage.getItem(`reflections_encryption_key_${testUserId}`)
      const metadataData = localStorage.getItem(`reflections_key_metadata_${testUserId}`)
      expect(keyData).not.toBeNull()
      expect(metadataData).not.toBeNull()
    })
  })

  describe('Key Export/Import', () => {
    it('should export key as base64 string', async () => {
      await generateAndStoreKey(testUserId)

      const backup = await exportKeyForBackup(testUserId)

      expect(typeof backup).toBe('string')
      expect(backup.length).toBeGreaterThan(0)
      // Should be valid base64
      expect(() => atob(backup)).not.toThrow()
    })

    it('should include metadata in export', async () => {
      await generateAndStoreKey(testUserId)

      const backup = await exportKeyForBackup(testUserId)
      const decoded = JSON.parse(atob(backup))

      expect(decoded.version).toBeDefined()
      expect(decoded.keyData).toBeDefined()
      expect(decoded.metadata).toBeDefined()
      expect(decoded.exportedAt).toBeGreaterThan(0)
    })

    it('should import key from backup', async () => {
      // Generate and export a key
      await generateAndStoreKey(testUserId)
      const backup = await exportKeyForBackup(testUserId)

      // Clear storage
      deleteKey(testUserId)
      expect(hasStoredKey(testUserId)).toBe(false)

      // Import the backup
      const { key, metadata } = await importKeyFromBackup(testUserId, backup)

      expect(key).toBeDefined()
      expect(metadata.userId).toBe(testUserId)
      expect(hasStoredKey(testUserId)).toBe(true)
    })

    it('should maintain encryption functionality after import', async () => {
      // Generate key and encrypt something
      const { key: originalKey } = await generateAndStoreKey(testUserId)
      const testText = 'Secret family memory'
      const encrypted = await encryptText(testText, originalKey)

      // Export key
      const backup = await exportKeyForBackup(testUserId)

      // Simulate new device: clear storage
      deleteKey(testUserId)

      // Import on "new device"
      const { key: importedKey } = await importKeyFromBackup(testUserId, backup)

      // Should be able to decrypt with imported key
      const decrypted = await decryptText(encrypted, importedKey)
      expect(decrypted).toBe(testText)
    })

    it('should throw error for invalid backup data', async () => {
      await expect(importKeyFromBackup(testUserId, 'invalid-backup')).rejects.toThrow()
    })

    it('should throw error when exporting non-existent key', async () => {
      await expect(exportKeyForBackup('non-existent-user')).rejects.toThrow()
    })
  })

  describe('Key Deletion', () => {
    it('should delete key from storage', async () => {
      await generateAndStoreKey(testUserId)
      expect(hasStoredKey(testUserId)).toBe(true)

      deleteKey(testUserId)

      expect(hasStoredKey(testUserId)).toBe(false)
      expect(await getStoredKey(testUserId)).toBeNull()
    })

    it('should delete both key and metadata', async () => {
      await generateAndStoreKey(testUserId)

      deleteKey(testUserId)

      const keyData = localStorage.getItem(`reflections_encryption_key_${testUserId}`)
      const metadata = localStorage.getItem(`reflections_key_metadata_${testUserId}`)

      expect(keyData).toBeNull()
      expect(metadata).toBeNull()
    })
  })

  describe('Key Metadata', () => {
    it('should check if key exists', async () => {
      expect(hasStoredKey(testUserId)).toBe(false)

      await generateAndStoreKey(testUserId)

      expect(hasStoredKey(testUserId)).toBe(true)
    })

    it('should get key metadata without loading full key', async () => {
      const { metadata: original } = await generateAndStoreKey(testUserId)

      const metadata = getKeyMetadata(testUserId)

      expect(metadata).not.toBeNull()
      expect(metadata?.userId).toBe(original.userId)
      expect(metadata?.createdAt).toBe(original.createdAt)
      expect(metadata?.algorithm).toBe(original.algorithm)
    })

    it('should return null for non-existent metadata', () => {
      const metadata = getKeyMetadata('non-existent-user')

      expect(metadata).toBeNull()
    })
  })

  describe('Multiple User Isolation', () => {
    it('should isolate keys between users', async () => {
      await generateAndStoreKey(testUserId)
      await generateAndStoreKey(testUserId2)

      expect(hasStoredKey(testUserId)).toBe(true)
      expect(hasStoredKey(testUserId2)).toBe(true)

      // Delete one user's key
      deleteKey(testUserId)

      // Other user's key should remain
      expect(hasStoredKey(testUserId)).toBe(false)
      expect(hasStoredKey(testUserId2)).toBe(true)
    })

    it('should not allow cross-user key access', async () => {
      const { key: key1 } = await generateAndStoreKey(testUserId)
      const { key: key2 } = await generateAndStoreKey(testUserId2)

      // Encrypt with user 1's key
      const encrypted = await encryptText('Secret', key1)

      // Should not decrypt with user 2's key
      await expect(decryptText(encrypted, key2)).rejects.toThrow()
    })
  })
})

