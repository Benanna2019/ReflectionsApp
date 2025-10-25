import { describe, it, expect, beforeAll } from 'vitest'
import {
  generateEncryptionKey,
  importEncryptionKey,
  encryptText,
  decryptText,
  encryptFile,
  decryptFile,
  isWebCryptoAvailable,
  type EncryptedData,
} from './crypto'

describe('Encryption Service', () => {
  let testKey: CryptoKey
  let testKeyData: string

  beforeAll(async () => {
    // Generate a test key for all tests
    const { key, keyData } = await generateEncryptionKey()
    testKey = key
    testKeyData = keyData
  })

  describe('Web Crypto Availability', () => {
    it('should detect Web Crypto API availability', () => {
      expect(isWebCryptoAvailable()).toBe(true)
    })
  })

  describe('Key Generation', () => {
    it('should generate a valid encryption key', async () => {
      const { key, keyData } = await generateEncryptionKey()
      
      expect(key).toBeDefined()
      expect(key.type).toBe('secret')
      expect(key.algorithm.name).toBe('AES-GCM')
      expect((key.algorithm as AesKeyAlgorithm).length).toBe(256)
      expect(keyData).toBeDefined()
      expect(typeof keyData).toBe('string')
      expect(keyData.length).toBeGreaterThan(0)
    })

    it('should generate unique keys each time', async () => {
      const { keyData: key1 } = await generateEncryptionKey()
      const { keyData: key2 } = await generateEncryptionKey()
      
      expect(key1).not.toBe(key2)
    })
  })

  describe('Key Import/Export', () => {
    it('should import a key from exported data', async () => {
      const importedKey = await importEncryptionKey(testKeyData)
      
      expect(importedKey).toBeDefined()
      expect(importedKey.type).toBe('secret')
      expect(importedKey.algorithm.name).toBe('AES-GCM')
    })

    it('should maintain key functionality after import', async () => {
      const importedKey = await importEncryptionKey(testKeyData)
      const testText = 'Test message'
      
      // Encrypt with original key
      const encrypted = await encryptText(testText, testKey)
      
      // Decrypt with imported key
      const decrypted = await decryptText(encrypted, importedKey)
      
      expect(decrypted).toBe(testText)
    })

    it('should throw error for invalid key data', async () => {
      await expect(importEncryptionKey('invalid-key-data')).rejects.toThrow()
    })
  })

  describe('Text Encryption', () => {
    it('should encrypt and decrypt text successfully', async () => {
      const originalText = 'This is my family reflection! 💙'
      
      const encrypted = await encryptText(originalText, testKey)
      const decrypted = await decryptText(encrypted, testKey)
      
      expect(decrypted).toBe(originalText)
    })

    it('should produce different ciphertext each time (due to random IV)', async () => {
      const text = 'Same text'
      
      const encrypted1 = await encryptText(text, testKey)
      const encrypted2 = await encryptText(text, testKey)
      
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext)
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
    })

    it('should include algorithm metadata', async () => {
      const text = 'Test'
      const encrypted = await encryptText(text, testKey)
      
      expect(encrypted.algorithm).toBe('AES-GCM-256')
      expect(encrypted.iv).toBeDefined()
      expect(encrypted.ciphertext).toBeDefined()
    })

    it('should handle empty strings', async () => {
      const encrypted = await encryptText('', testKey)
      const decrypted = await decryptText(encrypted, testKey)
      
      expect(decrypted).toBe('')
    })

    it('should handle special characters and emojis', async () => {
      const text = '特殊文字 🎉 émojis & symbols!@#$%^&*()'
      const encrypted = await encryptText(text, testKey)
      const decrypted = await decryptText(encrypted, testKey)
      
      expect(decrypted).toBe(text)
    })

    it('should handle very long text', async () => {
      const longText = 'A'.repeat(10000)
      const encrypted = await encryptText(longText, testKey)
      const decrypted = await decryptText(encrypted, testKey)
      
      expect(decrypted).toBe(longText)
    })

    it('should fail to decrypt with wrong key', async () => {
      const text = 'Secret message'
      const encrypted = await encryptText(text, testKey)
      
      const { key: wrongKey } = await generateEncryptionKey()
      
      await expect(decryptText(encrypted, wrongKey)).rejects.toThrow()
    })

    it('should fail to decrypt corrupted data', async () => {
      const corruptedData: EncryptedData = {
        ciphertext: 'corrupted',
        iv: 'corrupted',
        algorithm: 'AES-GCM-256',
      }
      
      await expect(decryptText(corruptedData, testKey)).rejects.toThrow()
    })
  })

  describe('File Encryption', () => {
    it('should encrypt and decrypt a file successfully', async () => {
      // Create a test file
      const originalContent = 'Test file content'
      const blob = new Blob([originalContent], { type: 'text/plain' })
      const file = new File([blob], 'test.txt', { type: 'text/plain' })
      
      // Encrypt
      const { encryptedBlob, iv } = await encryptFile(file, testKey)
      
      // Decrypt
      const decryptedBlob = await decryptFile(encryptedBlob, iv, testKey, 'text/plain')
      
      // Verify
      const decryptedText = await decryptedBlob.text()
      expect(decryptedText).toBe(originalContent)
    })

    it('should encrypt binary data (simulated image)', async () => {
      // Create a binary blob (simulating an image)
      const imageData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46])
      const imageBlob = new Blob([imageData], { type: 'image/jpeg' })
      
      // Encrypt
      const { encryptedBlob, iv } = await encryptFile(imageBlob, testKey)
      
      // Decrypt
      const decryptedBlob = await decryptFile(encryptedBlob, iv, testKey, 'image/jpeg')
      
      // Verify size
      expect(decryptedBlob.size).toBe(imageData.length)
      expect(decryptedBlob.type).toBe('image/jpeg')
      
      // Verify content
      const decryptedArray = new Uint8Array(await decryptedBlob.arrayBuffer())
      expect(Array.from(decryptedArray)).toEqual(Array.from(imageData))
    })

    it('should produce different encrypted blobs for same file (due to random IV)', async () => {
      const blob = new Blob(['Same content'], { type: 'text/plain' })
      
      const { encryptedBlob: encrypted1, iv: iv1 } = await encryptFile(blob, testKey)
      const { encryptedBlob: encrypted2, iv: iv2 } = await encryptFile(blob, testKey)
      
      expect(iv1).not.toBe(iv2)
      expect(encrypted1.size).toBe(encrypted2.size)
    })

    it('should preserve file size (approximately, with GCM overhead)', async () => {
      const content = 'X'.repeat(1000)
      const blob = new Blob([content], { type: 'text/plain' })
      
      const { encryptedBlob } = await encryptFile(blob, testKey)
      
      // GCM adds 16 bytes for auth tag
      expect(encryptedBlob.size).toBeGreaterThanOrEqual(blob.size)
      expect(encryptedBlob.size).toBeLessThan(blob.size + 100) // Some overhead
    })

    it('should fail to decrypt with wrong key', async () => {
      const blob = new Blob(['Secret file'], { type: 'text/plain' })
      const { encryptedBlob, iv } = await encryptFile(blob, testKey)
      
      const { key: wrongKey } = await generateEncryptionKey()
      
      await expect(decryptFile(encryptedBlob, iv, wrongKey)).rejects.toThrow()
    })
  })

  describe('Security Properties', () => {
    it('should not leak plaintext in encrypted data', async () => {
      const secretText = 'very secret password'
      const encrypted = await encryptText(secretText, testKey)
      
      // Encrypted data should not contain the plaintext
      expect(encrypted.ciphertext).not.toContain(secretText)
      expect(encrypted.iv).not.toContain(secretText)
    })

    it('should use authenticated encryption (GCM)', async () => {
      const text = 'Important data'
      const encrypted = await encryptText(text, testKey)
      
      // Try to modify the ciphertext
      const modifiedData: EncryptedData = {
        ...encrypted,
        ciphertext: encrypted.ciphertext + 'tampered',
      }
      
      // Decryption should fail for tampered data
      await expect(decryptText(modifiedData, testKey)).rejects.toThrow()
    })

    it('should use unique IVs for each encryption', async () => {
      const text = 'Test'
      const ivs = new Set<string>()
      
      // Encrypt multiple times
      for (let i = 0; i < 10; i++) {
        const encrypted = await encryptText(text, testKey)
        ivs.add(encrypted.iv)
      }
      
      // All IVs should be unique
      expect(ivs.size).toBe(10)
    })
  })
})

