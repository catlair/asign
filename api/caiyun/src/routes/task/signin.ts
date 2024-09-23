import { tasks } from '@asign/caiyun-core'
import { getAuthInfo } from '@asign/utils-pure'
import { init } from '@asunajs/caiyun'
import { defu } from 'defu'
import type { FastifyPluginAsync } from 'fastify'
import { createLogger } from '../../utils/logger.js'

const fn: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.route({
    method: 'GET',
    url: '/task/signin',
    handler: async (request, reply) => {
      const logger = await createLogger(reply)
      try {
        const { $, jwtToken } = await init(getAuthInfo(request.query.auth), {
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
    },
  })
}

export default fn
