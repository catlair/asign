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
  config: Record<string, any>
}

const fn: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: Body }>('/shake', {}, async (request, reply) => {
    const logger = await createLogger(reply)
    try {
      const { $ } = await init(getAuthInfo(request.body.auth), {
        logger,
      })
      $.config = defu({ shake: request.body.config }, $.config)
      await tasks.shakeTask($)
    } catch (error) {
      logger.error(error)
    } finally {
      reply.sse({ event: 'end', data: '' })
      reply.sseContext.source.end()
    }
  })
}

export default fn
