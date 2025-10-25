# Authentication System

This module provides a complete authentication system using InstantDB's built-in auth with **magic codes** (6-digit verification codes).

## Files

- **`AuthProvider.tsx`** - Auth context provider and hook
- **`SignInForm.tsx`** - Email input component (step 1)
- **`CodeVerificationForm.tsx`** - Code verification component (step 2)
- **`ProtectedRoute.tsx`** - Route guard for authenticated routes
- **`index.ts`** - Exports for easy imports

## Setup

### 1. Configure InstantDB Auth

In the InstantDB Dashboard:
1. Go to your app settings
2. Enable **Magic Code** authentication
3. Configure email settings (InstantDB uses its own email service)
4. Optional: Add custom email templates

### 2. Wrap Your App

The `AuthProvider` is already set up in `__root.tsx`:

```tsx
import { AuthProvider } from '@/lib/auth/AuthProvider'

function RootDocument({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Usage

### Sign In Page (Two-Step Flow)

```tsx
import { SignInForm, CodeVerificationForm } from '@/lib/auth'

function SignInPage() {
  const [email, setEmail] = useState<string | null>(null)

  return email ? (
    <CodeVerificationForm email={email} onBack={() => setEmail(null)} />
  ) : (
    <SignInForm onCodeSent={setEmail} />
  )
}
```

### Protected Routes

Wrap any route that requires authentication:

```tsx
import { ProtectedRoute } from '@/lib/auth'

function DashboardPage() {
  return (
    <ProtectedRoute>
      <YourProtectedContent />
    </ProtectedRoute>
  )
}
```

### Access User State

Use the `useAuth` hook anywhere in your app:

```tsx
import { useAuth } from '@/lib/auth'

function MyComponent() {
  const { user, isLoading, sendMagicCode, signInWithMagicCode, signOut } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Not signed in</div>

  return (
    <div>
      <p>Welcome {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

## Auth Flow

1. **User enters email** → `sendMagicCode(email)` is called
2. **6-digit code sent** → InstantDB sends email with verification code
3. **User enters code** → `signInWithMagicCode(email, code)` is called
4. **Code verified** → User is authenticated
5. **Auth state updates** → `user` object becomes available

## Security Features

✅ **Passwordless** - No passwords to manage or leak  
✅ **Time-limited** - Magic codes expire after 15 minutes  
✅ **One-time use** - Each code can only be used once  
✅ **6-digit codes** - Easy to enter, hard to guess
✅ **Secure tokens** - JWT tokens managed by InstantDB  
✅ **Auto-refresh** - Tokens automatically refresh  

## TypeScript Support

Full type safety for user objects:

```tsx
import type { User } from '@instantdb/react'

const user: User = {
  id: 'user-id',
  email: 'user@example.com',
  // ... other properties
}
```

## Testing

### Test Authentication

1. Start the dev server: `pnpm dev`
2. Navigate to `/auth/sign-in`
3. Enter your email
4. Check your email for the 6-digit code
5. Enter the code in the verification form
6. You'll be automatically signed in and redirected to `/dashboard`

### Test Protected Routes

1. Navigate to `/dashboard` while signed out → redirects to `/auth/sign-in`
2. Sign in
3. Navigate to `/dashboard` again → shows protected content
4. Sign out → redirects to sign-in

## Error Handling

The auth system includes comprehensive error handling:

```tsx
const { error } = useAuth()

if (error) {
  // Handle auth error
  console.error('Auth error:', error)
}
```

Common errors:
- Invalid email format
- Email delivery failure
- Expired magic code (15 minutes)
- Invalid code entered
- Network errors

## Next Steps

After authentication is working:
1. Create user profiles on first sign-in
2. Link profiles to `$users` entity
3. Set up payment verification
4. Add subscription status checks
5. Implement user onboarding flow

## Resources

- [InstantDB Auth Docs](https://docs.instantdb.com/docs/auth)
- [Magic Code Auth Guide](https://docs.instantdb.com/docs/auth#magic-code-auth)
- [Security Considerations](https://docs.instantdb.com/docs/security)

