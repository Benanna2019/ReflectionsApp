/**
 * Inngest Client Configuration
 * 
 * Configures the Inngest client for workflow orchestration
 */

import { Inngest } from 'inngest'

// Create Inngest client
export const inngest = new Inngest({
  id: 'reflections',
  name: 'Reflections App',
})

