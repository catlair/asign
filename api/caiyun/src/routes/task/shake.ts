import { tasks } from '@asign/caiyun-core'
import { getAuthInfo } from '@asign/utils-pure'
import { init } from '@asunajs/caiyun'
import { defu } from 'defu'
import type { FastifyPluginAsync } from 'fastify'
import { createLogger } from '../../utils/logger.js'

const fn: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.route({
    method: 'GET',
    url: '/shake',
    handler: async (request, reply) => {
      const logger = await createLogger(reply)
      try {
        const { $ } = await init(getAuthInfo(request.query.auth), {
          logger,
        })
        $.config = defu({ shake: JSON.parse(Buffer.from(request.query.config, 'base64').toString('utf-8')) }, $.config)
        await tasks.shakeTask($)
      } catch (error) {
        logger.error(error)
      } finally {
        reply.sse({ event: 'end', data: '' })
        reply.sseContext.source.end()
      }
    },
  })
}

export default fn
