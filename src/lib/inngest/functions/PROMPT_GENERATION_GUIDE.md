# AI Prompt Generation - Testing Guide

## Overview

The AI prompt generation system uses OpenAI's GPT-4-turbo to generate thoughtful reflection prompts for parents. Prompts are generated in batches of 50 and stored with "pending" status for admin review.

## How It Works

```
1. Admin clicks "Generate 50 Prompts" 
   ↓
2. Inngest function triggered
   ↓
3. OpenAI generates 50 prompts
   ↓
4. Prompts saved to InstantDB (status: "pending")
   ↓
5. Admin reviews and approves/rejects
   ↓
6. Approved prompts shown to users
```

---

## Testing the System

### 1. Start Development Servers

```bash
# Terminal 1: Start the app
pnpm dev

# Terminal 2: Start Inngest dev server
npx inngest-cli@latest dev
```

### 2. Access Admin Dashboard

Navigate to: `http://localhost:3000/admin/prompts`

You should see:
- Statistics (Pending, Active, Total)
- "Generate 50 Prompts" button
- List of pending prompts
- List of active prompts

### 3. Generate Prompts

1. Click **"Generate 50 Prompts"** button
2. Check Inngest dashboard at `http://localhost:8288`
3. Watch the function execute:
   - Step 1: Generate prompts with AI
   - Step 2: Save prompts to database
   - Step 3: Log results

**Expected Result:**
- Alert: "Prompt generation started!"
- After ~10-30 seconds: 50 new prompts appear in "Pending" section

### 4. Review Prompts

For each pending prompt:
- Click **✓ Approve** to activate (status → "active")
- Click **✗ Reject** to reject (status → "rejected")

**Expected Result:**
- Prompt moves from "Pending" to "Active" section
- Statistics update in real-time

### 5. Test User Experience

1. Navigate to `/reflections/new`
2. Check the "Today's Reflection Prompt" card
3. Should show an approved prompt from the database

**Expected Behavior:**
- If approved prompts exist: Shows one from database
- If no approved prompts: Shows fallback prompt

---

## Manual Testing with Inngest

You can manually trigger generation from the Inngest dashboard:

1. Go to `http://localhost:8288`
2. Click "Trigger Function"
3. Select `generate-reflection-prompts`
4. Send event:

```json
{
  "name": "prompts/generate.requested",
  "data": {
    "batchSize": 10,
    "category": "daily"
  }
}
```

---

## Testing Checklist

- [ ] Generate 50 prompts successfully
- [ ] Prompts appear in "Pending" section
- [ ] Approve a prompt → moves to "Active"
- [ ] Reject a prompt → removed from view
- [ ] Statistics update correctly
- [ ] User sees approved prompts on /reflections/new
- [ ] Fallback works when no approved prompts
- [ ] Inngest function shows in dashboard
- [ ] Error handling works (try with invalid API key)

---

## Common Issues

### Issue: "Failed to generate prompts"

**Cause:** OpenAI API key not set
**Fix:** Add `OPENAI_API_KEY` to `.env`

### Issue: "Prompts not appearing"

**Cause:** Inngest not running
**Fix:** Start Inngest dev server: `npx inngest-cli@latest dev`

### Issue: "Cannot approve prompts"

**Cause:** Permissions issue
**Fix:** Check permissions in `instant.perms.ts` - admins can update prompts

### Issue: "User sees pending prompts"

**Cause:** Permissions not filtering by status
**Fix:** Permissions should filter: `data.status == "active"`

---

## Monitoring in Production

1. **Inngest Dashboard:** Monitor function executions
2. **Admin Dashboard:** Check prompt approval rate
3. **Database:** Query prompts by status

```typescript
// Get pending count
const { data } = useQuery({
  prompts: {
    $: { where: { status: 'pending' } }
  }
})
```

---

## Future Enhancements

- [ ] Batch approve/reject
- [ ] Edit prompts before approving
- [ ] Categorize prompts (daily, weekly, special)
- [ ] Schedule automatic generation
- [ ] A/B test prompt variations
- [ ] Analytics on prompt usage
- [ ] User favorites
- [ ] Community-submitted prompts

