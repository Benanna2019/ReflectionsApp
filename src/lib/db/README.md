# InstantDB Database Setup

This directory contains the InstantDB client and backend setup for real-time, offline-first database operations.

## 📁 Files

- **`client.ts`** - Client-side InstantDB SDK (`@instantdb/react`)
- **`backend.ts`** - Server-side InstantDB Admin SDK (`@instantdb/admin`)
- **`index.ts`** - Exports for client usage
- **`queries.example.ts`** - Example queries and mutations
- **`permissions.ts`** - Permission rules documentation

## 🔐 Schema & Permissions

The schema and permissions are defined at the root level:
- **`instant.schema.ts`** - Database schema (entities, attributes, links)
- **`instant.perms.ts`** - Access control rules (CEL syntax)

## 🎯 Usage

### Client-Side (React Components)

Use the client SDK in React components:

```typescript
import { useQuery, transact, tx, useAuth } from '@/lib/db'

function MyComponent() {
  // Query data with live updates
  const { data, isLoading } = useQuery({
    reflections: {
      $: {
        where: { userId: user.id },
        order: { serverCreatedAt: 'desc' },
      },
    },
  })

  // Mutate data
  const handleUpdate = () => {
    transact([
      tx.reflections[reflectionId].update({
        text: 'Updated reflection',
      }),
    ])
  }

  // Check auth status
  const { user, isLoading: authLoading } = useAuth()
}
```

### Server-Side (API Routes, Inngest Functions)

Use the admin SDK in backend code:

```typescript
import { adminDb, tx, id } from '@/lib/db/backend'

// In an API route or Inngest function
export async function handler() {
  // Query data (single request, no live updates)
  const data = await adminDb.query({
    reflections: {},
  })

  // Mutate data (bypasses permissions)
  await adminDb.transact([
    tx.userProfiles[userId].update({
      subscriptionStatus: 'active',
    }),
  ])

  // Generate IDs
  const newId = id()
}
```

## 🔑 Environment Variables

### Client (Public)
```env
VITE_INSTANTDB_APP_ID=your_app_id_here
```

### Server (Private)
```env
INSTANT_APP_ADMIN_TOKEN=your_admin_token_here
```

**⚠️ Never expose `INSTANT_APP_ADMIN_TOKEN` in client code!**

## 🚀 Getting Your Credentials

1. Go to [InstantDB Dashboard](https://instantdb.com/dash)
2. Select or create your app
3. **App ID**: Copy from the dashboard header
4. **Admin Token**: Go to App Settings → Admin Token → Generate

## 📤 Pushing Schema & Permissions

After modifying `instant.schema.ts` or `instant.perms.ts`:

```bash
# Login to InstantDB CLI
npx instant-cli@latest login

# Push schema
npx instant-cli@latest push schema

# Push permissions
npx instant-cli@latest push perms

# Or push both at once
npx instant-cli@latest push
```

## 🔄 Client vs Admin SDK

### Client SDK (`@instantdb/react`)
- ✅ Live queries (real-time updates)
- ✅ Optimistic updates
- ✅ Offline support
- ✅ Respects permissions
- ⚠️ Exposes app ID (public)
- **Use in**: React components, client-side code

### Admin SDK (`@instantdb/admin`)
- ✅ Server-side operations
- ✅ Bypasses permissions
- ✅ Async query (no live updates)
- ✅ Auth methods (`createToken`, `verifyToken`)
- ⚠️ Requires admin token (private)
- **Use in**: API routes, Inngest functions, scripts

## 📚 Key Differences

| Feature | Client SDK | Admin SDK |
|---------|-----------|-----------|
| Import | `@instantdb/react` | `@instantdb/admin` |
| Query | `useQuery()` (hook) | `await db.query()` (async) |
| Transact | `transact()` (sync) | `await db.transact()` (async) |
| Permissions | ✅ Enforced | ❌ Bypassed |
| Real-time | ✅ Live updates | ❌ Single request |
| Auth | `useAuth()` hook | `db.auth.*` methods |

## 🔐 Security Best Practices

1. **Never commit tokens**: Add `.env` to `.gitignore`
2. **Rotate tokens**: If admin token leaks, regenerate immediately
3. **Use permissions**: Don't rely on admin SDK in public endpoints
4. **Validate input**: Always validate user input before transactions
5. **Audit logs**: Log sensitive operations for security

## 📖 Resources

- [InstantDB Documentation](https://instantdb.com/docs)
- [Schema Guide](https://instantdb.com/docs/schema)
- [Permissions Guide](https://instantdb.com/docs/permissions)
- [Admin SDK Reference](https://instantdb.com/docs/backend)
- [Client SDK Reference](https://instantdb.com/docs/instaml)
