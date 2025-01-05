import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z, zFromError } from '../utils/zod'

const app = new Hono()
  .get('/text', (c) => c.text('List Users'))
  .get('/json', (c) => c.json({ text: 'List Users' }))
  .get('/error', () => {
    throw new Error('Error 响应')
  })
  .get('/error2', () => {
    throw new HTTPException(400, { message: 'Error2 响应' })
  })
  /**
   * testtest
   */
  .get(
    '/zod',
    zValidator(
      'query',
      z.object({ name: z.string(), age: z.number() }),
      (result, ctx) => {
        if (result.success) {
          return ctx.json({
            ...result.data,
          })
        }
        return ctx.json(
          {
            message: zFromError(result),
          },
          400,
        )
      },
    ),
  )

export default app
