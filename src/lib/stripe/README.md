# Stripe Payment Integration

One-time payment processing with Stripe Checkout for lifetime app access.

## 🔐 Overview

This module handles:
- Creating Stripe checkout sessions
- Processing webhook events
- Updating user subscription status
- Payment verification

## 📁 Files

- **`checkout.ts`** - Checkout session creation
- **`webhook.ts`** - Webhook event handling
- **`index.ts`** - Main exports

## 🚀 Setup

### 1. Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your **Secret Key** and **Publishable Key**
3. Create a webhook endpoint
4. Get the **Webhook Secret**

### 2. Configure Environment Variables

Add to `.env`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Server URL for redirect URLs
SERVER_URL=http://localhost:3000
```

### 3. Set Up Webhook

In Stripe Dashboard:
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://yourdomain.com/api/stripe/webhook`
4. Events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** to `STRIPE_WEBHOOK_SECRET`

## 💳 Payment Flow

```
User → Click "Pay" → API creates checkout session
                  ↓
          Redirect to Stripe Checkout
                  ↓
        User enters payment info
                  ↓
       Stripe processes payment
                  ↓
    Webhook: checkout.session.completed
                  ↓
          Verify Stripe Signature
                  ↓
        Send Event to Inngest (async)
                  ↓
   Inngest processes in background:
     - Validate session data
     - Update InstantDB: subscriptionStatus = 'active'
     - Log success
                  ↓
     Redirect to /payment/success
```

### Why Inngest?

**Reliability:**
- Automatic retries on failure
- No webhook timeouts
- Durable execution state

**Performance:**
- Webhook responds immediately (200 OK)
- Heavy processing happens async
- Scales automatically

**Observability:**
- Full execution history
- Step-by-step logs
- Error tracking

See [Inngest README](../inngest/README.md) for details.

## 🔌 API Endpoints

### POST /api/stripe/create-checkout

Create a checkout session.

**Request:**
```json
{
  "userId": "user-id",
  "userEmail": "user@example.com"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/stripe/webhook

Stripe webhook receiver. Automatically called by Stripe.

**Headers:**
- `stripe-signature` - Webhook signature for verification

## 💻 Usage

### In Components

```tsx
import { PaymentRequired } from '@/components/payment/PaymentRequired'

function App() {
  return <PaymentRequired />
}
```

### Direct API Usage

```typescript
import { createCheckoutSession } from '@/lib/stripe'

const session = await createCheckoutSession({
  userId: user.id,
  userEmail: user.email,
  successUrl: 'https://yourdomain.com/payment/success',
  cancelUrl: 'https://yourdomain.com/payment/cancel',
})

// Redirect to checkout
window.location.href = session.url
```

### Webhook Handling

```typescript
import { verifyWebhookSignature, handleWebhookEvent } from '@/lib/stripe'

// In your API route
const event = verifyWebhookSignature(rawBody, signature)
await handleWebhookEvent(event)
```

## 🧪 Testing

### Test Cards

Stripe provides test cards for development:

**Success:**
- `4242 4242 4242 4242` - Visa
- Any future expiry date
- Any 3-digit CVC
- Any ZIP code

**Declined:**
- `4000 0000 0000 0002` - Card declined

### Test Webhooks

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
```

### Test Flow

1. Start dev server: `pnpm dev`
2. Navigate to `/payment`
3. Click "Proceed to Secure Checkout"
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Verify redirect to `/payment/success`
7. Check InstantDB that `subscriptionStatus = 'active'`

## 🔒 Security

### Webhook Verification

All webhooks are verified using Stripe signatures:

```typescript
const event = verifyWebhookSignature(body, signature)
// Throws error if signature is invalid
```

### PCI Compliance

- ✅ Card data never touches our servers
- ✅ Stripe handles all payment processing
- ✅ Use Stripe's hosted checkout page
- ✅ No need for PCI certification

### Best Practices

1. **Always verify webhook signatures**
2. **Use HTTPS in production**
3. **Store keys in environment variables** (never in code)
4. **Handle idempotency** (webhooks may be sent multiple times)
5. **Log all payment events** for debugging

## 💰 Pricing

Current setup:
- **One-time payment**: $49.00
- **Lifetime access**
- **No subscriptions**

To change pricing, update `checkout.ts`:

```typescript
unit_amount: 4900, // $49.00 in cents
```

## 🐛 Troubleshooting

**"Invalid webhook signature"**
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Ensure you're sending raw request body (not parsed JSON)

**"No user ID found in checkout session"**
- Verify `client_reference_id` is set when creating session
- Check `metadata.userId` is included

**Webhook not firing**
- Verify webhook URL in Stripe Dashboard
- Check server logs for errors
- Use Stripe CLI to test locally

**Payment succeeded but user not updated**
- Check InstantDB permissions
- Verify user ID matches between Stripe and InstantDB
- Check webhook handler logs

## 📊 Monitoring

### Important Events to Track

1. **checkout.session.completed** - Payment successful
2. **payment_intent.succeeded** - Payment confirmed
3. **payment_intent.payment_failed** - Payment failed
4. **checkout.session.expired** - Session expired

### Logging

All events are logged:

```typescript
✅ Payment successful for user: user-id
💰 Payment succeeded: pi_...
❌ Payment failed: pi_...
```

## 🔄 Webhook Retry Logic

Stripe automatically retries failed webhooks:
- Immediate retry
- After 1 hour
- After 24 hours
- After 72 hours

Return `200 OK` to acknowledge receipt.

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Checkout Sessions](https://stripe.com/docs/payments/checkout)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

