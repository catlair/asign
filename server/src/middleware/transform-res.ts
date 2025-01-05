import { createMiddleware } from 'hono/factory'

export const transformResponse = createMiddleware(async (c, next) => {
  await next()

  const res = c.res.clone()

  try {
    const json = await res.json()

    c.res = undefined
    c.res = new Response(
      res.status === 200
        ? JSON.stringify({
          code: 0,
          data: json,
        })
        : JSON.stringify({
          code: json.code || res.status,
          message: json.message,
        }),
      res,
    )
  } catch {}
})
