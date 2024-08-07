import {
  createApi,
  createGardenApi,
  createNewAuth,
  getJwtToken,
  handleOldConfig,
  type M,
  run as runCore,
} from '@asign/caiyun-core'
import { defuConfig } from '@asign/caiyun-core/options'
import { getAuthInfo, sleepSync } from '@asign/utils-pure'
import { rewriteConfigSync } from '@asunajs/conf'
import { createRequest } from '@asunajs/http'
import { sendNotify } from '@asunajs/push'
import {
  compare,
  createLogger,
  getLocalStorage,
  type LoggerPushData,
  md5,
  pushMessage,
  setLocalStorage,
  sleep,
} from '@asunajs/utils'
import { defu } from 'defu'
import { uploadTask } from './service/uploadTask.js'
import { myMD5 } from './utils/md5.js'

export type Config = M['config']
export type Option = { pushData?: LoggerPushData[] }
export { sleep }

export async function init(
  config: Config,
  localStorage: M['localStorage'] = {},
  option?: Option,
) {
  config = defu(config, defuConfig)
  const logger = await createLogger({ pushData: option?.pushData })
  if (config.phone.length !== 11 || !config.phone.startsWith('1')) {
    logger.info(`auth 格式解析错误，请查看是否填写正确的 auth`)
    return
  }

  const baseUA =
    'Mozilla/5.0 (Linux; Android 13; 22041216C Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/121.0.6167.178 Mobile Safari/537.36'

  const DATA: M['DATA'] = {
    baseUA,
    mailUaEnd: '(139PE_WebView_Android_10.2.2_mcloud139)',
    mailRequested: 'cn.cj.pe',
    mcloudRequested: 'com.chinamobile.mcloud',
  }

  let jwtToken: string

  const http = createRequest({
    hooks: {
      beforeRequest: [
        (options) => {
          if ((options.url as URL).hostname === 'caiyun.feixin.10086.cn') {
            jwtToken && (options.headers['jwttoken'] = jwtToken)
          } else {
            options.headers['authorization'] = config.auth
          }
        },
      ],
    },
    headers: {
      'user-agent': DATA.baseUA,
      'x-requested-with': DATA.mcloudRequested,
      'charset': 'utf-8',
      'content-type': 'application/json;charset=UTF-8',
    },
    retry: {
      limit: 3,
      methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS', 'TRACE'],
    },
  })

  const $: M = {
    api: createApi(http),
    config,
    gardenApi: createGardenApi(http),
    logger,
    DATA,
    sleep,
    node: {
      uploadTask,
      myMD5,
    },
    md5,
    store: {},
    localStorage,
    http,
  }

  logger.info(`==============`)
  logger.info(`登录账号【${config.phone}】`)
  jwtToken = await getJwtToken($)

  return {
    $,
    logger,
    jwtToken,
  }
}

export async function main(
  config: Config,
  localStorage: M['localStorage'] = {},
  option?: Option,
) {
  const { $, logger, jwtToken } = await init(config, localStorage, option)
  if (!jwtToken) return

  await runCore($)
  const newAuth = await createNewAuth($)
  logger.info(`==============\n\n`)
  return {
    newAuth,
    localStorage,
  }
}

/**
 * 本地运行
 * @param inputPath 配置文件地址
 */
export async function run(inputPath?: string) {
  const { config, path, message } = await loadConfig(inputPath)

  const logger = await createLogger()

  const versionInfo = await getVersion()

  versionInfo && logger.info(versionInfo)

  if (!config || !config.length) return logger.error('未找到配置文件/变量')

  const pushData: LoggerPushData[] = [
    { level: 3, type: 'info', date: new Date(), msg: '文档地址：https://as.js.cool' },
  ]
  versionInfo && pushData.push({ level: 3, type: 'info', date: new Date(), msg: versionInfo })
  const ls = getLocalStorage(path, 'caiyun')

  for (let index = 0; index < config.length; index++) {
    const c = config[index]
    if (handleOldConfig(c)) {
      logger.warn('auth 配置方式过旧，请及时修改，下个版本将不再兼容')
    }
    if (!c.auth) {
      logger.error('该配置中不存在 auth')
      continue
    }
    try {
      const authInfo = getAuthInfo(c.auth)
      const { newAuth, localStorage } = await main(
        {
          ...c,
          ...authInfo,
        },
        ls[authInfo.phone],
        { pushData },
      )
      if (newAuth) {
        rewriteConfigSync(path, ['caiyun', index, 'auth'], newAuth)
      }
      if (localStorage) {
        ls[authInfo.phone] = localStorage
      }
    } catch (error) {
      logger.error(error)
    }
  }

  setLocalStorage(path, 'caiyun', ls)

  await pushMessage({
    pushData,
    message,
    sendNotify,
    createRequest,
  })
}

export async function useExchange(config: Config, message: Record<string, any>) {
  const logger = await createLogger()
  const pushData = [{ level: 3, type: 'info', date: new Date(), msg: '文档地址：https://as.js.cool' }]

  try {
    const authInfo = getAuthInfo(config.auth)
    const { $, jwtToken } = await init(
      {
        ...config,
        ...authInfo,
      },
      {},
      { pushData },
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
      /** 等待到 0 点 */
      waitTo24Hour: () => {
        const now = new Date()
        const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 100)
        const time = nextDay.getTime() - now.getTime()
        if (time > 120000) return
        return sleepSync(time)
      },
      /** 快速兑换 */
      exchangeQuickly: async (prizeId: number, prizeName?: string) => exchangeApi($, prizeId, prizeName),
    }
  } catch (error) {
    logger.error(error)
  }
}

export async function loadConfig(inputPath?: string) {
  const { loadConfig: _lc } = await import('@asunajs/conf')
  const r = _lc<{
    caiyun: Config[]
    message?: Record<string, any>
  }>(inputPath)

  if (!r.config) {
    throw new Error('配置文件为空')
  }

  return {
    config: r.config.caiyun,
    message: r.config.message,
    path: r.path,
  }
}

interface Npmmirror {
  'dist-tags': {
    latest: string
  }
  'time': Record<string, string>
}

async function getVersion() {
  try {
    const http = createRequest()
    const { 'dist-tags': distTags } = await http.get<Npmmirror>('https://registry.npmmirror.com/@asunajs/caiyun/')

    const npmVersion = distTags.latest
    if (compare(npmVersion, '__ASIGN_VERSION__', '>')) {
      return '检测到新版本：' + npmVersion + '，当前版本：__ASIGN_VERSION__，请及时更新！'
    }

    return '当前版本：__ASIGN_VERSION__'
  } catch {
  }
}
