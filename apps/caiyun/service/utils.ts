import { createApi, createGardenApi, getJwtToken, type M } from '@asign/caiyun-core'
import { defuConfig } from '@asign/caiyun-core/options'
import { hidePhone } from '@asign/utils-pure'
import { loadConfig as _lc } from '@asunajs/conf'
import { createRequest } from '@asunajs/http'
import { md5, sleep } from '@asunajs/utils'
import { defu } from 'defu'
import { uploadTask } from '../service/upload-task.js'
import type { Config, Option } from '../types.js'
import { encryptAiUserId } from '../utils/ai-userid-aes.js'
import { myMD5 } from '../utils/md5.js'

export async function init(
  config: Config,
  { logger, localStorage, jwtToken }: Option,
) {
  config = defu(config, defuConfig)
  if (!config.phone) {
    logger.error(`auth 格式解析错误，请查看是否填写正确的 auth`)
    return
  }
  if (config.phone.length !== 11 || !config.phone.startsWith('1')) {
    logger.info(`auth 格式解析错误，请查看是否填写正确的 auth`)
    return
  }

  const baseUA =
    'Mozilla/5.0 (Linux; Android 13; 22041216C Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.88 Mobile Safari/537.36'

  const DATA: M['DATA'] = {
    baseUA,
    mailUaEnd: '(139PE_WebView_Android_10.2.2_mcloud139)',
    mailRequested: 'cn.cj.pe',
    mcloudRequested: 'com.chinamobile.mcloud',
  }

  const http = createRequest({
    hooks: {
      beforeRequest: [
        (options) => {
          if ((options.url as URL).hostname === 'caiyun.feixin.10086.cn') {
            jwtToken && (options.headers['jwttoken'] = jwtToken)
            options.headers['authorization'] = 'Basic ' + config.auth
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
      encryptAiUserId,
    },
    md5,
    store: {},
    localStorage,
    http,
  }

  logger.info(`==============`)
  printNickName($)
  jwtToken ||= await getJwtToken($)

  return {
    $,
    logger,
    jwtToken,
  }
}

export async function loadConfig(inputPath?: string) {
  const r = await _lc<{
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

function printNickName({ config, logger }: M) {
  logger.info(`登录账号【${config.nickname || hidePhone(config.phone)}】`)
}
