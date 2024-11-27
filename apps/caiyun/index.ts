import { Caiyun, createNewAuth, run as runCore } from '@asign/caiyun-core'
import type { LoggerType } from '@asign/types'
import { isString, isUndefined } from '@asign/utils-pure'
import { loadConfig as _lc, rewriteConfigSync } from '@asunajs/conf'
import { createLogger, type LoggerPushData, sleep } from '@asunajs/utils'
import { init, loadConfig, pushMessage } from './service/utils.js'
import type { Option, UserConfig } from './types.js'

export { createLogger, sleep }
export * from './service/index.js'

export async function main(
  userConfig: Caiyun,
  option?: Option,
) {
  const { $, logger, jwtToken } = await init(userConfig, option)
  if (!jwtToken) return { $, isNoLogin: true }

  await runCore($)
  const newAuth = await createNewAuth($)
  logger.info(`==============\n\n`)
  return { newAuth, $ }
}

export async function getConfig(inputPath?: string | UserConfig) {
  if (isUndefined(inputPath) || isString(inputPath)) {
    return await loadConfig(inputPath)
  }
  return inputPath
}

/**
 * 本地运行
 * @param config 配置
 */
export async function run(config?: UserConfig): Promise<void>
/**
 * 本地运行
 * @param inputPath 配置文件地址
 */
export async function run(inputPath?: string): Promise<void>

export async function run(inputPath?: string | UserConfig) {
  const { config, path, message } = await getConfig(inputPath)

  const pushData: LoggerPushData[] = [
    { level: 3, type: 'info', date: new Date(), msg: '文档地址：https://as.js.cool' },
  ]
  const logger = await createLogger({ pushData })

  pushData.push({ level: 3, type: 'info', date: new Date(), msg: `当前版本 __ASIGN_VERSION__` })

  if (!config || !config.length) return logger.error('未找到配置文件/变量')

  const { expiredAuth } = await _run(config, logger, path)

  await pushExpiredAuth(expiredAuth, message)

  await pushMessage({
    pushData,
    message,
  })
}

export async function pushExpiredAuth(expiredAuth: string[], message: Record<string, any>) {
  if (expiredAuth.length) {
    await pushMessage({
      pushData: [
        { level: 0, type: 'error', date: new Date(), msg: `存在账号过期，请重新登录` },
        ...expiredAuth.map(i => ({ level: 3, type: 'info', date: new Date(), msg: i })),
      ],
      message: {
        ...message,
        title: '账号过期推送',
      },
    })
  }
}

export async function _run(config: Caiyun[], logger: LoggerType, path: string) {
  // 过期 auth 列表
  const expiredAuth: string[] = []

  for (let index = 0; index < config.length; index++) {
    const userConfig = config[index]
    if (!userConfig.auth) {
      logger.error('该配置中不存在 auth')
      continue
    }
    try {
      const { newAuth, $, isNoLogin } = await main(userConfig, { logger })

      if (isNoLogin) {
        expiredAuth.push($?.config?.phone)
        continue
      }

      if (newAuth) {
        rewriteConfigSync(path, ['caiyun', index, 'auth'], newAuth)
      }
    } catch (error) {
      logger.error(error)
    }
  }

  return {
    expiredAuth,
  }
}
