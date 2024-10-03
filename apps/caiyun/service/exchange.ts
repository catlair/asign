import { getAuthInfo, sleepSync } from '@asign/utils-pure'
import { createRequest } from '@asunajs/http'
import { sendNotify } from '@asunajs/push'
import { createLogger, pushMessage } from '@asunajs/utils'
import type { Config } from '../types'
import { init } from './utils.js'

/**
 * @param hour 0 12 16 20
 * @param delay 延时 ms
 */
function waitToHour(hour: number = 0, delay = 300) {
  const now = new Date()
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0, delay)
  const time = nextDay.getTime() - now.getTime()
  console.info('等待：', time)
  return sleepSync(time)
}

/**
 * 等待到下一个整点
 * @param delay 延时 ms
 */
export function waitToNextHour(delay?: number) {
  const now = new Date()
  if ([0, 12, 16, 20, 24].includes(now.getHours())) return
  return waitToHour(now.getHours() + 1, delay)
}

export async function useExchange(config: Config, message: Record<string, any>) {
  const pushData = [{ level: 3, type: 'info', date: new Date(), msg: '文档地址：https://as.js.cool' }]
  const logger = await createLogger({ pushData })

  try {
    const authInfo = getAuthInfo(config.auth)
    const { $, jwtToken } = await init(
      {
        ...config,
        ...authInfo,
      },
      { logger },
    )
    if (!jwtToken) return

    const { exchangeTask, exchangeApi } = await import('@asign/caiyun-core')

    const sendMessage = (msg?: string) => {
      message.title = msg || message.title
      message.onlyError = false
      return pushMessage({
        pushData,
        message,
        sendNotify,
        createRequest,
      })
    }

    return {
      exchange: async (ids: number[]) => {
        const msg = await exchangeTask($, ids)
        if (msg) {
          await sendMessage(msg).catch(err => logger.error(err))
        }
      },
      sendMessage,
      waitToNextHour,
      /** 快速兑换 */
      exchangeQuickly: async (prizeId: number, prizeName?: string) => exchangeApi($, prizeId, prizeName),
    }
  } catch (error) {
    logger.error(error)
  }
}

type MultipleConfig = {
  user: Config
  ids: number[]
}

export function useMultiExchange(config: MultipleConfig[], message: Record<string, any>) {
  return Promise.all(config.map(async ({ user, ids }) => {
    const { exchange } = await useExchange(user, message)

    waitToNextHour()

    return exchange(ids)
  }))
}
