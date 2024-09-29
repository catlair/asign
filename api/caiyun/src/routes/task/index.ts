import { createLogger } from '@/utils/logger.js'
import { type M, tasks } from '@asign/caiyun-core'
import { getAuthInfo } from '@asign/utils-pure'
import { init } from '@asunajs/caiyun'
import { defu } from 'defu'
import type { FastifyPluginAsync } from 'fastify'

/**
 * 请求体
 */
type Body = {
  auth: string
  config: Record<string, any> | string | undefined
}

const routes = [
  {
    path: '/sign',
    handler: tasks.signIn,
  },
  {
    path: '/shake',
    handler: tasks.shakeTask,
    configName: 'shake',
  },
  {
    path: '/backup',
    handler: tasks.backupGiftTask,
  },
  {
    path: '/redpack',
    handler: tasks.aiRedPackTask,
    configName: 'aiRedPack',
  },
  {
    path: '/cloud',
    handler: tasks.aiCloudTask,
  },
  {
    path: '/garden',
    handler: tasks.gardenTask,
    configName: 'garden',
  },
  {
    path: '/share',
    handler: tasks.shareFindTask,
  },
  {
    path: '/blindbox',
    handler: tasks.blindboxTask,
  },
]

const fn: FastifyPluginAsync = async (fastify) => {
  routes.forEach(({ path, handler, configName }) => {
    fastify.post<{ Body: Body }>(path, {}, async (request, reply) => {
      const { auth, config } = request.body
      const logger = await createLogger(reply)

      try {
        const { $ } = await init(getAuthInfo(auth), { logger })

        if (configName) {
          $.config = defu({ [configName]: config }, $.config) as M['config']
        }

        await handler($)
      } catch (error) {
        logger.error(error)
      } finally {
        reply.sse({ event: 'end', data: '' })
        reply.sseContext.source.end()
      }
    })
  })
}

export default fn
