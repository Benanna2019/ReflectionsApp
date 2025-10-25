/**
 * AI Prompt Generation Function
 * 
 * Generates thoughtful reflection prompts using OpenAI
 * Stores them in InstantDB with "pending" status for admin review
 */

import { inngest } from '../client'
import { adminDb } from '@/lib/db/backend'
import { id } from '@instantdb/admin'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

/**
 * Generate 50 thoughtful reflection prompts
 */
export const generateReflectionPrompts = inngest.createFunction(
  {
    id: 'generate-reflection-prompts',
    name: 'Generate Reflection Prompts',
  },
  { event: 'prompts/generate.requested' },
  async ({ event, step }) => {
    const { batchSize = 50, category = 'daily' } = event.data

    // Step 1: Generate prompts using OpenAI
    const prompts = await step.run('generate-prompts-with-ai', async () => {
      try {
        const { text } = await generateText({
          model: openai('gpt-4-turbo'),
          prompt: `You are a thoughtful prompt creator for a daily reflection journaling app used by parents to capture precious moments with their children.

Generate exactly ${batchSize} unique, engaging reflection prompts that encourage parents to:
- Notice small, meaningful moments
- Express gratitude
- Reflect on their feelings and growth
- Capture memories they'll treasure
- Think about their child's development

Guidelines:
- Keep prompts short (under 15 words)
- Use warm, encouraging language
- Make them specific enough to spark memories, but open enough for interpretation
- Avoid clichés
- Focus on everyday moments, not just milestones
- Include prompts about feelings, observations, gratitude, challenges, and joy

Format: Return ONLY a JSON array of strings, like this:
["prompt 1", "prompt 2", "prompt 3", ...]

Do not include any other text, markdown, or explanation - ONLY the JSON array.`,
          temperature: 0.9, // Higher temperature for more creative prompts
        })

        // Parse the JSON response
        const promptsArray = JSON.parse(text.trim()) as string[]

        if (!Array.isArray(promptsArray)) {
          throw new Error('AI did not return a valid array of prompts')
        }

        console.log(`✅ Generated ${promptsArray.length} prompts`)
        return promptsArray
      } catch (error) {
        console.error('Error generating prompts:', error)
        throw error
      }
    })

    // Step 2: Save prompts to InstantDB
    const savedPrompts = await step.run('save-prompts-to-db', async () => {
      try {
        const transactions = prompts.map((promptText) => {
          const promptId = id()
          return adminDb.tx.prompts[promptId].update({
            promptText,
            status: 'pending', // Requires admin approval
            category,
            createdBy: 'ai',
            createdAt: Date.now(),
          })
        })

        await adminDb.transact(transactions)

        console.log(`✅ Saved ${prompts.length} prompts to database with "pending" status`)
        
        return {
          count: prompts.length,
          status: 'pending',
          promptIds: transactions.map((tx) => tx),
        }
      } catch (error) {
        console.error('Error saving prompts to database:', error)
        throw error
      }
    })

    // Step 3: Log results
    await step.run('log-generation-results', async () => {
      console.log('📊 Prompt Generation Summary:')
      console.log(`   - Generated: ${savedPrompts.count} prompts`)
      console.log(`   - Status: ${savedPrompts.status}`)
      console.log(`   - Category: ${category}`)
      console.log(`   - Awaiting admin review`)
    })

    return {
      success: true,
      generatedCount: savedPrompts.count,
      status: savedPrompts.status,
      category,
      message: `Successfully generated ${savedPrompts.count} prompts. Awaiting admin approval.`,
    }
  }
)

/**
 * Event type definition for TypeScript
 */
export type GeneratePromptsEvent = {
  name: 'prompts/generate.requested'
  data: {
    batchSize?: number
    category?: string
  }
}

/**
 * Helper function to trigger prompt generation
 * 
 * Usage (from server-side code):
 * ```typescript
 * import { inngest } from '@/lib/inngest'
 * 
 * await inngest.send({
 *   name: 'prompts/generate.requested',
 *   data: { batchSize: 50, category: 'daily' }
 * })
 * ```
 */

