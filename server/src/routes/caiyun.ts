import { zFromError } from '@/utils/zod'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { readFile, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { getConfig, patchConfig } from '../service/caiyun'

const app = new Hono()
  .get('/config', async (c) => {
    return c.json(await getConfig())
  })
  .get('/config/raw', async c => {
    const { path } = await getConfig()
    return c.json({
      path,
      code: await readFile(path, 'utf-8'),
    })
  })
  .patch(
    '/config',
    zValidator(
      'json',
      z.object(
        {
          path: z.array(z.union([z.string(), z.number()])),
          value: z.any(),
        },
      ),
      async (result, ctx) => {
        if (result.success) {
          const err = await patchConfig(['caiyun', ...result.data.path], result.data.value)
          if (err) {
            return ctx.json(
              {
                message: err.message,
              },
              400,
            )
          }
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
  .put('/config', async (c) => {
    const body = await c.req.json()
    const { path } = await getConfig()
    return c.json({
      message: await writeFile(path, body.code),
    })
  })
  .delete('/config', async (c) => {
    // const { path } = await getConfig()
    return c.json({
      message: '未实现',
    })
  })

export default app
