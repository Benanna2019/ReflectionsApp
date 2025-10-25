# Daily Reflection Capture System

This system allows users to capture daily reflections with photos and text, all encrypted client-side before storage.

## Components

### 1. PhotoUpload
**Location:** `PhotoUpload.tsx`

Handles photo capture and upload with encryption:
- Camera/gallery selection with single UI
- Image compression (max 1920px, 85% quality)
- Client-side encryption using AES-256-GCM
- Preview with loading states
- Max 10MB file size

**Usage:**
```tsx
<PhotoUpload
  onPhotoEncrypted={(data) => {
    // Handle encrypted photo data
    // data: { encryptedFile: ArrayBuffer, iv: string, algorithm: string }
  }}
  onPhotoRemoved={() => {
    // Handle photo removal
  }}
/>
```

### 2. ReflectionTextInput
**Location:** `ReflectionTextInput.tsx`

Textarea for reflection text with encryption:
- Character counter (2000 char limit)
- Auto-encryption with debouncing (500ms)
- Client-side encryption using AES-256-GCM
- Visual feedback during encryption

**Usage:**
```tsx
<ReflectionTextInput
  onTextEncrypted={(data) => {
    // Handle encrypted text
    // data: { encryptedText: string, iv: string, algorithm: string }
  }}
  placeholder="Custom placeholder..."
  maxLength={2000}
/>
```

### 3. DailyPrompt
**Location:** `DailyPrompt.tsx`

Displays daily reflection prompts:
- Queries approved prompts from database
- Fallback to default prompts if none available
- Deterministic daily selection (same prompt all day)
- Hash-based rotation using date + userId

**Fallback Prompts:**
- "What made you smile today?"
- "What are you grateful for right now?"
- "What challenged you today, and how did you handle it?"
- And 5 more...

**Usage:**
```tsx
<DailyPrompt />
```

### 4. ReflectionStatus
**Location:** `ReflectionStatus.tsx`

Shows completion status and streak:
- Checks if today's reflection is complete
- Calculates daily streak
- Displays total reflection count
- Shows streak badge with fire emoji

**Usage:**
```tsx
<ReflectionStatus userProfileId={userProfile.id} />
```

## Routes

### New Reflection Page
**Location:** `src/routes/reflections/new.tsx`

Full-featured reflection creation page:
- Daily prompt display
- Photo upload
- Text input
- Encrypted storage to InstantDB
- Success/error handling
- Auto-redirect after save

**Route:** `/reflections/new`

**Features:**
- Protected route (requires authentication)
- Real-time encryption status
- Privacy notice
- Save button with validation

## Data Flow

### Creating a Reflection

1. **User selects/captures photo**
   - Compressed to max 1920px
   - Encrypted client-side with AES-256-GCM
   - Stored in component state

2. **User writes reflection text**
   - Debounced encryption (500ms)
   - Encrypted with unique IV
   - Stored in component state

3. **User saves reflection**
   - Encrypted photo uploaded to InstantDB storage
   - Reflection record created with:
     - Encrypted text
     - Link to encrypted photo
     - Link to user profile
     - Encryption metadata (IV, algorithm)
     - Timestamp and sync status

4. **Success**
   - Shows success message
   - Redirects to dashboard after 2 seconds

## Encryption Details

All encryption happens **client-side** before data leaves the device:

- **Algorithm:** AES-256-GCM (authenticated encryption)
- **Key Storage:** LocalStorage (per user)
- **IV:** Unique for each encryption operation
- **Key Management:** Handled by `useEncryption` hook

### Encryption Flow

```
User Data (photo/text)
  ↓
Compression (photos only)
  ↓
Client-side Encryption (AES-256-GCM)
  ↓
Upload to InstantDB
  ↓
Stored Encrypted (server never sees plaintext)
```

## Database Schema

### Reflections Entity
```typescript
{
  encryptedReflectionText: string  // Encrypted text
  syncStatus: string               // 'synced' | 'pending' | 'failed'
  createdAt: number               // Unix timestamp
  encryptionAlgorithm: string     // 'AES-256-GCM'
  encryptionIV: string            // Base64 encoded IV
  
  // Links
  user: userProfile               // Creator
  photo: $file                    // Encrypted photo file
  prompt: prompt                  // Associated prompt
}
```

## Integration with Dashboard

The dashboard shows:
- Reflection status for today
- Total reflection count
- Current streak
- "Create New Reflection" button

```tsx
// Dashboard integration
{userProfile && <ReflectionStatus userProfileId={userProfile.id} />}

<Button onClick={() => navigate({ to: '/reflections/new' })}>
  <Plus /> Create New Reflection
</Button>
```

## Testing Checklist

- [ ] Photo upload from camera works
- [ ] Photo upload from gallery works
- [ ] Image compression reduces file size
- [ ] Photos are encrypted before upload
- [ ] Text input encrypts with debouncing
- [ ] Character counter shows correctly
- [ ] Daily prompt rotates daily
- [ ] Same prompt shows all day
- [ ] Fallback prompts work when no DB prompts
- [ ] Reflection saves to database
- [ ] Success message shows
- [ ] Redirects to dashboard after save
- [ ] Reflection status updates on dashboard
- [ ] Streak calculation is correct
- [ ] Cannot save without photo
- [ ] Cannot save without text
- [ ] Error messages display properly

## Next Steps

1. **Reflection Viewing:**
   - Create page to view past reflections
   - Implement decryption for viewing
   - Add pagination/filtering

2. **Photo Gallery:**
   - Grid view of reflection photos
   - Calendar view for date selection
   - Search and filter capabilities

3. **Prompt Management:**
   - Admin interface for prompt curation
   - AI-generated prompt system
   - User prompt suggestions

4. **Email Summaries:**
   - Weekly/monthly reflection summaries
   - Email delivery system
   - Preference management

## Privacy & Security

✅ **End-to-end encryption** - Data encrypted before leaving device  
✅ **Client-side only** - Server never sees plaintext  
✅ **Unique IVs** - Each encryption uses unique initialization vector  
✅ **Authenticated encryption** - GCM mode prevents tampering  
✅ **User-specific keys** - Each user has their own encryption key  
✅ **Secure key storage** - Keys stored in browser LocalStorage  

