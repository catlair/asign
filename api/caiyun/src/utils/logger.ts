import { type FastifyReply } from 'fastify'
import type {} from 'fastify-sse-v2'

export async function createLogger(reply: FastifyReply) {
  const { createConsola, consola } = await import('consola')
  consola.options.level = 5
  return createConsola({
    level: 5,
    reporters: [
      {
        log: ({ type, args, level, date }) => {
          reply.sse({ data: JSON.stringify({ args, type, level, date }) })
          consola[type].apply(consola, args)
        },
      },
    ],
  })
}
