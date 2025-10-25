/**
 * Client-Side Encryption Service
 * 
 * Uses Web Crypto API for AES-256-GCM encryption
 * All encryption happens client-side before data is sent to InstantDB
 * 
 * Security Notes:
 * - Encryption keys are stored in LocalStorage (never sent to server)
 * - AES-256-GCM provides authenticated encryption
 * - Each encryption uses a unique IV (initialization vector)
 * - Keys are generated using cryptographically secure random values
 */

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits recommended for GCM

export interface EncryptedData {
  ciphertext: string // Base64 encoded
  iv: string // Base64 encoded initialization vector
  algorithm: string // 'AES-256-GCM'
}

export interface EncryptionKey {
  key: CryptoKey
  keyData: string // Base64 encoded for export
}

/**
 * Generate a new encryption key using Web Crypto API
 * 
 * @returns Promise<EncryptionKey> - The generated key and its exportable form
 */
export async function generateEncryptionKey(): Promise<EncryptionKey> {
  try {
    // Generate a new AES-256 key
    const key = await crypto.subtle.generateKey(
      {
        name: ALGORITHM,
        length: KEY_LENGTH,
      },
      true, // extractable (so we can export it)
      ['encrypt', 'decrypt']
    )

    // Export the key to raw format
    const rawKey = await crypto.subtle.exportKey('raw', key)
    
    // Convert to base64 for storage
    const keyData = arrayBufferToBase64(rawKey)

    return { key, keyData }
  } catch (error) {
    console.error('Failed to generate encryption key:', error)
    throw new Error('Failed to generate encryption key')
  }
}

/**
 * Import an encryption key from base64 string
 * 
 * @param keyData - Base64 encoded key data
 * @returns Promise<CryptoKey> - The imported key
 */
export async function importEncryptionKey(keyData: string): Promise<CryptoKey> {
  try {
    const rawKey = base64ToArrayBuffer(keyData)
    
    const key = await crypto.subtle.importKey(
      'raw',
      rawKey,
      {
        name: ALGORITHM,
        length: KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    )

    return key
  } catch (error) {
    console.error('Failed to import encryption key:', error)
    throw new Error('Failed to import encryption key')
  }
}

/**
 * Encrypt text data (for reflections)
 * 
 * @param text - Plain text to encrypt
 * @param key - Encryption key
 * @returns Promise<EncryptedData> - Encrypted data with IV
 */
export async function encryptText(text: string, key: CryptoKey): Promise<EncryptedData> {
  try {
    // Generate a random IV for this encryption
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

    // Convert text to ArrayBuffer
    const encoder = new TextEncoder()
    const data = encoder.encode(text)

    // Encrypt the data
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      data
    )

    return {
      ciphertext: arrayBufferToBase64(ciphertext),
      iv: arrayBufferToBase64(iv),
      algorithm: `${ALGORITHM}-${KEY_LENGTH}`,
    }
  } catch (error) {
    console.error('Failed to encrypt text:', error)
    throw new Error('Failed to encrypt text')
  }
}

/**
 * Decrypt text data (for reflections)
 * 
 * @param encryptedData - Encrypted data with IV
 * @param key - Decryption key
 * @returns Promise<string> - Decrypted plain text
 */
export async function decryptText(
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<string> {
  try {
    const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext)
    const iv = base64ToArrayBuffer(encryptedData.iv)

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      ciphertext
    )

    // Convert ArrayBuffer back to string
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('Failed to decrypt text:', error)
    throw new Error('Failed to decrypt text. Data may be corrupted or key is incorrect.')
  }
}

/**
 * Encrypt a file/photo (Blob or File)
 * 
 * @param file - File or Blob to encrypt
 * @param key - Encryption key
 * @returns Promise<{ encryptedBlob: Blob, iv: string }> - Encrypted blob with IV
 */
export async function encryptFile(
  file: File | Blob,
  key: CryptoKey
): Promise<{ encryptedBlob: Blob; iv: string; algorithm: string }> {
  try {
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer()

    // Encrypt the file data
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      fileBuffer
    )

    // Create a new Blob from encrypted data
    const encryptedBlob = new Blob([ciphertext], { type: 'application/octet-stream' })

    return {
      encryptedBlob,
      iv: arrayBufferToBase64(iv),
      algorithm: `${ALGORITHM}-${KEY_LENGTH}`,
    }
  } catch (error) {
    console.error('Failed to encrypt file:', error)
    throw new Error('Failed to encrypt file')
  }
}

/**
 * Decrypt a file/photo Blob
 * 
 * @param encryptedBlob - Encrypted blob
 * @param iv - Base64 encoded initialization vector
 * @param key - Decryption key
 * @param originalType - Original MIME type (optional)
 * @returns Promise<Blob> - Decrypted blob
 */
export async function decryptFile(
  encryptedBlob: Blob,
  iv: string,
  key: CryptoKey,
  originalType = 'image/jpeg'
): Promise<Blob> {
  try {
    const ciphertext = await encryptedBlob.arrayBuffer()
    const ivBuffer = base64ToArrayBuffer(iv)

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: ivBuffer,
      },
      key,
      ciphertext
    )

    // Create a new Blob with original type
    return new Blob([decrypted], { type: originalType })
  } catch (error) {
    console.error('Failed to decrypt file:', error)
    throw new Error('Failed to decrypt file. Data may be corrupted or key is incorrect.')
  }
}

/**
 * Utility: Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Utility: Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Verify Web Crypto API is available
 */
export function isWebCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.getRandomValues !== 'undefined'
}

