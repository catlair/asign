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

const fn: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: Body }>('/redpack', {}, async (request, reply) => {
    const { auth, config } = request.body
    const logger = await createLogger(reply)
    try {
      const { $ } = await init(getAuthInfo(auth), {
        logger,
      })
      $.config = defu({ shake: config }, $.config)
      await tasks.aiRedPackTask($)
    } catch (error) {
      logger.error(error)
    } finally {
      reply.sse({ event: 'end', data: '' })
      reply.sseContext.source.end()
    }
  })
}

export default fn
