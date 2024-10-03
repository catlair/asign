import { createNewAuth, run as runCore } from '@asign/caiyun-core'
import { getStorage } from '@asign/unstorage'
import { getAuthInfo } from '@asign/utils-pure'
import { loadConfig as _lc, rewriteConfigSync } from '@asunajs/conf'
import { createRequest } from '@asunajs/http'
import { sendNotify } from '@asunajs/push'
import { createLogger, type LoggerPushData, pushMessage, sleep } from '@asunajs/utils'
import { init, loadConfig } from './service/utils.js'
import type { Config, Option } from './types.js'

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

/**
 * 本地运行
 * @param inputPath 配置文件地址
 */
export async function run(inputPath?: string) {
  const { config, path, message } = await loadConfig(inputPath)

  const pushData: LoggerPushData[] = [
    { level: 3, type: 'info', date: new Date(), msg: '文档地址：https://as.js.cool' },
  ]
  const logger = await createLogger({ pushData })

  // const versionInfo = await getVersion()
  // if (versionInfo) {
  //   logger.info(versionInfo)
  pushData.push({ level: 3, type: 'info', date: new Date(), msg: `当前版本 __ASIGN_VERSION__` })
  // }

  if (!config || !config.length) return logger.error('未找到配置文件/变量')

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

  await pushMessage({
    pushData,
    message,
    sendNotify,
    createRequest,
  })
}

// interface Npmmirror {
//   'dist-tags': {
//     latest: string
//   }
//   'time': Record<string, string>
// }

// async function getVersion() {
//   try {
//     const http = createRequest()
//     const { 'dist-tags': distTags } = await http.get<Npmmirror>('https://registry.npmmirror.com/@asunajs/caiyun/')

//     const npmVersion = distTags.latest

//     return compare(npmVersion, '__ASIGN_VERSION__', '>')
//       ? '检测到新版本：' + npmVersion + '，当前版本：__ASIGN_VERSION__，请及时更新！'
//       : '当前版本：__ASIGN_VERSION__'
//   } catch {
//   }
// }
