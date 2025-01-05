import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'
import { transformResponse } from './middleware/transform-res'
import routes from './routes'

const hono = new Hono()

hono.use(logger()).use(transformResponse)

hono.notFound((c) => {
  return c.json({ message: '404 Not Found' }, 404)
})

hono.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ message: err.message, code: err.status }, err.status)
  }

  return c.json({ message: err.message, code: 500 }, 500)
})

const app = hono.route('/api', routes)

export type AppType = typeof app

export { app }
