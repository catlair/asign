import { createLogger } from '@/utils/logger.js'
import { tasks } from '@asign/caiyun-core'
import { getAuthInfo } from '@asign/utils-pure'
import { init } from '@asunajs/caiyun'
import { defu } from 'defu'
import type { FastifyPluginAsync } from 'fastify'

/**
 * 请求体
 */
type Body = {
  auth: string
}

const fn: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: Body }>('/signin', {
    schema: {
      body: {
        type: 'object',
        properties: {
          auth: {
            type: 'string',
          },
        },
      },
    },
  }, async (request, reply) => {
    const logger = await createLogger(reply)
    try {
      const { $, jwtToken } = await init(getAuthInfo(request.body.auth), {
        logger,
        jwtToken: '',
      })
      logger.debug(jwtToken)
      $.config = defu({ shake: { num: 1 } }, $.config)
      await tasks.signIn($)
    } catch (error) {
      logger.error(error)
    } finally {
      reply.sse({ event: 'close' })
      reply.sseContext.source.end()
    }
  })
}

export default fn
