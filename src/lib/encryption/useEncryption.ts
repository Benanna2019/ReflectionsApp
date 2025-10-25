/**
 * useEncryption Hook
 * 
 * React hook for easy access to encryption functions
 * Automatically manages keys for the current user
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { getOrCreateKey, type StoredKey } from './keyStorage'
import { encryptText, decryptText, encryptFile, decryptFile, type EncryptedData } from './crypto'

export function useEncryption() {
  const { user } = useAuth()
  const [storedKey, setStoredKey] = useState<StoredKey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load or generate encryption key when user signs in
  useEffect(() => {
    async function initializeKey() {
      if (!user?.id) {
        setStoredKey(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const key = await getOrCreateKey(user.id)
        setStoredKey(key)
      } catch (err) {
        console.error('Failed to initialize encryption key:', err)
        setError('Failed to initialize encryption')
      } finally {
        setIsLoading(false)
      }
    }

    initializeKey()
  }, [user?.id])

  /**
   * Encrypt reflection text
   */
  const encrypt = useCallback(
    async (text: string): Promise<EncryptedData> => {
      if (!storedKey) {
        throw new Error('Encryption key not available')
      }
      return await encryptText(text, storedKey.key)
    },
    [storedKey]
  )

  /**
   * Decrypt reflection text
   */
  const decrypt = useCallback(
    async (encryptedData: EncryptedData): Promise<string> => {
      if (!storedKey) {
        throw new Error('Encryption key not available')
      }
      return await decryptText(encryptedData, storedKey.key)
    },
    [storedKey]
  )

  /**
   * Encrypt a photo file
   */
  const encryptPhoto = useCallback(
    async (file: File | Blob): Promise<{ encryptedBlob: Blob; iv: string; algorithm: string }> => {
      if (!storedKey) {
        throw new Error('Encryption key not available')
      }
      return await encryptFile(file, storedKey.key)
    },
    [storedKey]
  )

  /**
   * Decrypt a photo blob
   */
  const decryptPhoto = useCallback(
    async (encryptedBlob: Blob, iv: string, originalType?: string): Promise<Blob> => {
      if (!storedKey) {
        throw new Error('Encryption key not available')
      }
      return await decryptFile(encryptedBlob, iv, storedKey.key, originalType)
    },
    [storedKey]
  )

  return {
    // State
    isLoading,
    error,
    isReady: !!storedKey && !isLoading,
    keyMetadata: storedKey?.metadata,

    // Functions
    encrypt,
    decrypt,
    encryptPhoto,
    decryptPhoto,
  }
}

