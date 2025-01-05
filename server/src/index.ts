import { serve } from '@hono/node-server'
import { showRoutes } from 'hono/dev'
import { app } from './lib'

export * from './lib'

showRoutes(app, {
  verbose: true,
})

const port = 8787
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
