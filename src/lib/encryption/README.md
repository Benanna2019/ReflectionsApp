# Client-Side Encryption Service

End-to-end encryption for photos and reflections using Web Crypto API.

## 🔐 Overview

All sensitive user data (photos and reflection text) is encrypted **client-side** before being sent to InstantDB. This ensures zero-knowledge architecture where even administrators cannot decrypt user content.

### Security Principles

- **Client-Side Only**: Encryption keys never leave the user's device
- **AES-256-GCM**: Industry-standard authenticated encryption
- **Unique IVs**: Each encryption uses a unique initialization vector
- **Key Isolation**: Each user has their own encryption key
- **LocalStorage**: Keys stored in browser (persistent across sessions)

## 📁 Files

- **`crypto.ts`** - Core encryption functions (encrypt/decrypt text and files)
- **`keyStorage.ts`** - Key generation, storage, and management
- **`useEncryption.ts`** - React hook for easy access
- **`index.ts`** - Main exports
- **`*.test.ts`** - Comprehensive test suites

## 🚀 Quick Start

### Using the React Hook

The easiest way to use encryption in components:

```tsx
import { useEncryption } from '@/lib/encryption'

function ReflectionForm() {
  const { encrypt, encryptPhoto, isReady, isLoading } = useEncryption()

  const handleSubmit = async (text: string, photo: File) => {
    if (!isReady) return

    // Encrypt text
    const encryptedText = await encrypt(text)
    
    // Encrypt photo
    const { encryptedBlob, iv, algorithm } = await encryptPhoto(photo)

    // Upload to InstantDB
    const photoUrl = await db.storage.uploadFile('photo.enc', encryptedBlob)
    
    // Store reflection
    await transact([
      tx.reflections[id].update({
        encryptedReflectionText: JSON.stringify(encryptedText),
        encryptionAlgorithm: algorithm,
        encryptionIV: iv,
      }),
      tx.reflections[id].link({ photo: photoUrl.data.id })
    ])
  }

  if (isLoading) return <div>Loading encryption...</div>
  
  return <form>...</form>
}
```

### Direct API Usage

For more control, use the core functions:

```typescript
import { 
  generateEncryptionKey, 
  encryptText, 
  decryptText,
  encryptFile,
  decryptFile 
} from '@/lib/encryption'

// Generate a key
const { key, keyData } = await generateEncryptionKey()

// Encrypt text
const encrypted = await encryptText('My reflection', key)
// Returns: { ciphertext: 'base64...', iv: 'base64...', algorithm: 'AES-GCM-256' }

// Decrypt text
const decrypted = await decryptText(encrypted, key)
// Returns: 'My reflection'

// Encrypt photo
const file = new File([photoBlob], 'photo.jpg')
const { encryptedBlob, iv } = await encryptFile(file, key)

// Decrypt photo
const decryptedBlob = await decryptFile(encryptedBlob, iv, key, 'image/jpeg')
```

## 🔑 Key Management

### Automatic Key Generation

Keys are automatically generated on first sign-in:

```typescript
import { getOrCreateKey } from '@/lib/encryption'

// Automatically generates if doesn't exist
const { key, metadata } = await getOrCreateKey(userId)
```

### Key Backup (Device Migration)

Export key for backup:

```typescript
import { exportKeyForBackup } from '@/lib/encryption'

const backup = await exportKeyForBackup(userId)
// Returns base64 string like: "eyJ2ZXJzaW9uIjoiMS4w..."

// Show to user to copy/save
console.log('Save this backup code:', backup)
```

Import key on new device:

```typescript
import { importKeyFromBackup } from '@/lib/encryption'

const backupCode = 'eyJ2ZXJzaW9uIjoiMS4w...' // From user
await importKeyFromBackup(userId, backupCode)

// All encrypted data now accessible on new device!
```

### Key Storage

Keys are stored in LocalStorage:

```typescript
import { hasStoredKey, getKeyMetadata, deleteKey } from '@/lib/encryption'

// Check if key exists
if (hasStoredKey(userId)) {
  console.log('Key found!')
}

// Get metadata without loading full key
const metadata = getKeyMetadata(userId)
console.log('Key created:', new Date(metadata.createdAt))

// Delete key (WARNING: Makes all data unrecoverable!)
deleteKey(userId)
```

## 🧪 Testing

Run tests:

```bash
pnpm test src/lib/encryption
```

Tests cover:
- ✅ Key generation and uniqueness
- ✅ Key import/export functionality
- ✅ Text encryption/decryption round-trip
- ✅ File encryption/decryption round-trip
- ✅ Special characters and emojis
- ✅ Binary data (images)
- ✅ Authenticated encryption (GCM)
- ✅ IV uniqueness
- ✅ Wrong key rejection
- ✅ Tampered data detection
- ✅ Key storage and retrieval
- ✅ Backup and restore
- ✅ Multi-user isolation

## 📊 Data Flow

### Encryption Flow (Upload)

```
User Photo → encryptFile() → Encrypted Blob → InstantDB Storage
                   ↓
              Random IV (stored with reflection)
                   ↓
            Encryption Key (stays in LocalStorage)
```

### Decryption Flow (View)

```
Encrypted Blob (from InstantDB) + IV + Key (from LocalStorage)
                   ↓
            decryptFile()
                   ↓
            Original Photo
```

## 🔒 Security Considerations

### What's Protected

- ✅ Photos (encrypted as blobs)
- ✅ Reflection text
- ✅ All user-generated content

### What's NOT Encrypted

- Email addresses (needed for auth)
- Timestamps (needed for sorting)
- Prompt IDs (references to prompts)
- Sync status

### Key Security

**Keys are stored in LocalStorage:**
- **Pros**: Persistent, easy to use, works offline
- **Cons**: Accessible to JavaScript on same domain
- **Mitigation**: HTTPS only, CSP headers, no XSS vulnerabilities

**Key Backup:**
- Users responsible for saving backup codes
- Lost key = lost data (by design)
- Backup codes should be stored securely (password manager)

### Zero-Knowledge Architecture

Even with database access, administrators see:
- ❌ Photos: Encrypted blobs (unreadable)
- ❌ Reflections: Encrypted text (unreadable)
- ✅ Metadata: Timestamps, user IDs, prompt IDs

## 🚨 Important Warnings

### Data Loss Prevention

```typescript
// ⚠️ NEVER delete keys without warning users
deleteKey(userId) // ALL DATA BECOMES UNRECOVERABLE

// ✅ Always export backup first
const backup = await exportKeyForBackup(userId)
// Show to user, let them save it
// Then delete if needed
```

### Device Migration

```typescript
// 📱 Setting up new device:
// 1. User signs in
// 2. Prompt: "Transfer data from another device?"
// 3. If yes: Ask for backup code
// 4. Import key from backup
// 5. All data now accessible

if (!hasStoredKey(userId)) {
  // Show backup import UI
  const backup = prompt('Enter your backup code')
  await importKeyFromBackup(userId, backup)
}
```

## 🎯 Best Practices

1. **Always check isReady before encrypting**
   ```typescript
   const { isReady } = useEncryption()
   if (!isReady) return // Key not loaded yet
   ```

2. **Handle errors gracefully**
   ```typescript
   try {
     await encrypt(text)
   } catch (err) {
     console.error('Encryption failed:', err)
     // Show user-friendly error
   }
   ```

3. **Store IVs with encrypted data**
   ```typescript
   const { encryptedBlob, iv } = await encryptPhoto(photo)
   // ALWAYS store IV with the encrypted data
   ```

4. **Use type-safe EncryptedData**
   ```typescript
   interface Reflection {
     encryptedText: EncryptedData // { ciphertext, iv, algorithm }
   }
   ```

5. **Test backup/restore flow**
   - Test on different browsers
   - Test on mobile devices
   - Ensure backup codes are portable

## 📚 Resources

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [AES-GCM Encryption](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
- [Cryptographic Best Practices](https://www.rfc-editor.org/rfc/rfc8446)

## 🐛 Troubleshooting

**"Encryption key not available"**
- User not signed in
- Key generation failed
- LocalStorage blocked

**"Failed to decrypt"**
- Wrong key used
- Data corrupted
- IV mismatch

**"Browser not supported"**
- Web Crypto API not available
- Use HTTPS (required for crypto.subtle)

