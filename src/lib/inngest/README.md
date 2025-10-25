# Inngest Workflow Orchestration

Asynchronous workflow orchestration for background tasks, scheduled jobs, and event processing.

## 🔐 Overview

This module handles:
- Async processing of Stripe webhook events
- Reliable retries with exponential backoff
- Step-based workflow execution
- Event-driven architecture

## 📁 Files

- **`client.ts`** - Inngest client configuration
- **`functions/stripe-payment.ts`** - Stripe payment event handlers
- **`functions/index.ts`** - Function exports
- **`index.ts`** - Main exports

## 🚀 Setup

### 1. Get Inngest Keys

1. Go to [Inngest Dashboard](https://app.inngest.com)
2. Create a new app or select existing
3. Get your **Event Key** and **Signing Key**

### 2. Configure Environment Variables

Add to `.env`:

```env
# Inngest Keys
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=signkey_prod_...
```

### 3. Serve Inngest Functions

The `/api/inngest` endpoint serves your Inngest functions:

**Development:**
```bash
pnpm dev
# Functions available at http://localhost:3000/api/inngest
```

**Production:**
Register your Inngest endpoint in the Inngest Dashboard:
```
https://yourdomain.com/api/inngest
```

## 🔄 Workflow Architecture

### Stripe Payment Flow

```
Stripe Webhook → /api/stripe/webhook
                      ↓
              Verify Signature
                      ↓
          Send Event to Inngest
                      ↓
         Inngest Function Processes
                      ↓
            Step 1: Validate Data
                      ↓
            Step 2: Update Database
                      ↓
            Step 3: Log Success
                      ↓
                  Complete
```

### Benefits

**Reliability:**
- Automatic retries on failure (3 attempts by default)
- Step-based execution (failed steps retry from last success)
- Durable state between steps

**Performance:**
- Webhook responds immediately (200 OK)
- Heavy processing happens async
- No timeout issues

**Observability:**
- Full execution history in Inngest Dashboard
- Step-by-step logs
- Error tracking and alerts

## 📝 Inngest Functions

### processCheckoutCompleted

Handles `checkout.session.completed` events.

**Trigger:**
```typescript
inngest.send({
  name: 'stripe/checkout.session.completed',
  data: { session: stripeSession }
})
```

**Steps:**
1. Validate session data and extract user ID
2. Update user subscription status in InstantDB
3. Log payment success

**Retries:** 3 attempts with exponential backoff

### processPaymentSucceeded

Handles `payment_intent.succeeded` events.

**Trigger:**
```typescript
inngest.send({
  name: 'stripe/payment_intent.succeeded',
  data: { paymentIntent: stripePaymentIntent }
})
```

**Steps:**
1. Log payment confirmation
2. Additional business logic (optional)

### processPaymentFailed

Handles `payment_intent.payment_failed` events.

**Trigger:**
```typescript
inngest.send({
  name: 'stripe/payment_intent.payment_failed',
  data: { paymentIntent: stripePaymentIntent }
})
```

**Steps:**
1. Log failure details
2. Handle failure (notifications, alerts, etc.)

## 💻 Usage

### Sending Events

From your webhook or API route:

```typescript
import { inngest } from '@/lib/inngest'

await inngest.send({
  name: 'stripe/checkout.session.completed',
  data: {
    session: checkoutSession,
    eventId: stripeEvent.id,
  }
})
```

### Creating New Functions

```typescript
import { inngest } from '../client'

export const myNewFunction = inngest.createFunction(
  {
    id: 'my-function-id',
    name: 'My New Function',
    retries: 3,
  },
  { event: 'my/event.name' },
  async ({ event, step }) => {
    // Step 1
    const result1 = await step.run('step-1-name', async () => {
      // Your logic here
      return { data: 'value' }
    })

    // Step 2 (only runs if Step 1 succeeds)
    await step.run('step-2-name', async () => {
      // Use result1.data
      return { success: true }
    })

    return { completed: true }
  }
)
```

### Registering New Functions

Add to `/src/routes/api/inngest.ts`:

```typescript
import { myNewFunction } from '@/lib/inngest/functions'

const inngestHandler = serve({
  client: inngest,
  functions: [
    // ... existing functions
    myNewFunction,
  ],
  signingKey: env.INNGEST_SIGNING_KEY,
})
```

## 🧪 Testing

### Local Development

1. Start dev server:
```bash
pnpm dev
```

2. Use Inngest Dev Server:
```bash
npx inngest-cli@latest dev
```

3. Trigger test events:
```bash
curl -X POST http://localhost:3000/api/inngest/test \
  -H "Content-Type: application/json" \
  -d '{"name":"stripe/checkout.session.completed","data":{"session":{}}}'
```

### Test with Stripe CLI

Forward Stripe webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Trigger test checkout:

```bash
stripe trigger checkout.session.completed
```

View function execution in Inngest Dashboard or Dev Server.

## 🔍 Monitoring

### Inngest Dashboard

View in [app.inngest.com](https://app.inngest.com):

- **Functions:** All registered functions
- **Runs:** Execution history with status
- **Logs:** Step-by-step execution logs
- **Errors:** Failed runs with full stack traces
- **Metrics:** Success rate, duration, volume

### Function Status

- ✅ **Completed** - Function finished successfully
- 🔄 **Running** - Currently executing
- ⏸️ **Sleeping** - Waiting between steps or retries
- ❌ **Failed** - All retries exhausted
- ⏭️ **Cancelled** - Manually cancelled

### Alerts

Configure alerts in Inngest Dashboard:
- Function failures
- High error rates
- Slow execution times
- Volume spikes

## 🔒 Security

### Signing Key Verification

All requests to `/api/inngest` are verified using your signing key:

```typescript
const inngestHandler = serve({
  signingKey: env.INNGEST_SIGNING_KEY,
  // Rejects requests without valid signature
})
```

### Environment Variables

- **Never commit keys** to source control
- **Use different keys** for dev/staging/production
- **Rotate keys** periodically from Inngest Dashboard

### Best Practices

1. **Always verify signatures** on webhook endpoints
2. **Use step functions** for idempotency
3. **Log sensitive operations** for audit trails
4. **Set appropriate retry counts** (don't retry forever)
5. **Handle PII carefully** (encrypt sensitive data)

## 🐛 Troubleshooting

**"Function not found"**
- Check function is registered in `/api/inngest.ts`
- Verify event name matches exactly
- Restart dev server after adding functions

**"Invalid signing key"**
- Check `INNGEST_SIGNING_KEY` is correct
- Ensure no extra whitespace in `.env`
- Verify key is from correct Inngest app

**Steps not retrying**
- Check retry count in function config
- View error details in Inngest Dashboard
- Ensure errors are thrown (not caught silently)

**Webhook not triggering function**
- Check event is being sent: `inngest.send(...)`
- Verify event name format: `category/event.name`
- Check Inngest Dashboard for received events

## 📊 Performance

### Recommended Practices

1. **Keep steps focused** - Each step should do one thing
2. **Limit step count** - < 10 steps per function ideal
3. **Timeout management** - Default 5min, adjust if needed
4. **Batch operations** - Process multiple items together
5. **Use sleep for rate limits** - `step.sleep('1m')`

### Step Timeouts

Configure timeouts for long-running steps:

```typescript
await step.run(
  'long-operation',
  async () => {
    // Your logic
  },
  { timeout: '10m' } // 10 minute timeout
)
```

### Concurrency Control

Limit concurrent executions:

```typescript
export const myFunction = inngest.createFunction(
  {
    id: 'my-function',
    concurrency: {
      limit: 10, // Max 10 concurrent executions
    },
  },
  // ... rest of function
)
```

## 🔄 Migrations

### Adding New Event Types

1. Create new function in `src/lib/inngest/functions/`
2. Export from `functions/index.ts`
3. Register in `/src/routes/api/inngest.ts`
4. Send events with `inngest.send()`
5. Test locally, then deploy

### Versioning Functions

When changing function behavior:

```typescript
// Old function (keep for transition)
export const myFunctionV1 = inngest.createFunction(
  { id: 'my-function-v1' },
  { event: 'my/event.v1' },
  // ... old logic
)

// New function
export const myFunctionV2 = inngest.createFunction(
  { id: 'my-function-v2' },
  { event: 'my/event.v2' },
  // ... new logic
)
```

## 📚 Resources

- [Inngest Documentation](https://www.inngest.com/docs)
- [Function Reference](https://www.inngest.com/docs/functions)
- [Event Reference](https://www.inngest.com/docs/events)
- [Step Functions Guide](https://www.inngest.com/docs/functions/multi-step)
- [Testing Guide](https://www.inngest.com/docs/local-development)

