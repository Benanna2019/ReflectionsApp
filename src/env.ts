import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    SERVER_URL: z.string().optional(),
    
    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    
    // Resend
    RESEND_API_KEY: z.string().min(1),
    
    // Inngest
    INNGEST_SIGNING_KEY: z.string().min(1).optional(),
    INNGEST_EVENT_KEY: z.string().min(1).optional(),
    
    // OpenAI (for AI SDK)
    OPENAI_API_KEY: z.string().min(1),
    
    // InstantDB Admin Token (server-side)
    INSTANT_APP_ADMIN_TOKEN: z.string().min(1),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).default('Reflections'),
    
    // InstantDB (client-side)
    VITE_INSTANTDB_APP_ID: z.string().min(1),
    
    // Stripe (client-side publishable key)
    VITE_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnvStrict: {
    SERVER_URL: process.env.SERVER_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    INSTANT_APP_ADMIN_TOKEN: process.env.INSTANT_APP_ADMIN_TOKEN,
    VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
    VITE_INSTANTDB_APP_ID: import.meta.env.VITE_INSTANTDB_APP_ID,
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  },

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
})
