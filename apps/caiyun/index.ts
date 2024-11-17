import { createNewAuth, run as runCore } from '@asign/caiyun-core'
import type { LoggerType } from '@asign/types'
import { getStorage } from '@asign/unstorage'
import { getAuthInfo, isString, isUndefined } from '@asign/utils-pure'
import { loadConfig as _lc, rewriteConfigSync } from '@asunajs/conf'
import { createRequest } from '@asunajs/http'
import { sendNotify } from '@asunajs/push'
import { createLogger, type LoggerPushData, pushMessage, sleep } from '@asunajs/utils'
import { init, loadConfig } from './service/utils.js'
import type { Config, Option, UserConfig } from './types.js'

export { sleep }
export * from './service/index.js'

export async function main(
  config: Config,
  option?: Option,
) {
  const { $, logger, jwtToken } = await init(config, option)
  if (!jwtToken) return

  await runCore($)
  const newAuth = await createNewAuth($)
  logger.info(`==============\n\n`)
  return { newAuth }
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

  await _run(config, logger, path)

  await pushMessage({
    pushData,
    message,
    sendNotify,
    createRequest,
  })
}

async function _run(config: Config[], logger: LoggerType, path: string) {
  for (let index = 0; index < config.length; index++) {
    const c = config[index]
    if (!c.auth) {
      logger.error('该配置中不存在 auth')
      continue
    }
    try {
      const authInfo = getAuthInfo(c.auth)

      const { newAuth } = await main(
        {
          ...c,
          ...authInfo,
        },
        { logger, localStorage: await getStorage('caiyun-' + authInfo.phone) },
      )

      if (newAuth) {
        rewriteConfigSync(path, ['caiyun', index, 'auth'], newAuth)
      }
    } catch (error) {
      logger.error(error)
    }
  }
}
