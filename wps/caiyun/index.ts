import { createApi, createGardenApi, createNewAuth, getJwtToken, M, run } from '@asign/caiyun-core'
import type { Caiyun } from '@asign/caiyun-core'
import { createLogger, getAuthInfo, getHostname } from '@asign/utils-pure'
import { createCookieJar, createRequest, getPushConfig, md5, sendWpsNotify } from '@asign/wps-utils'

type Config = Partial<Caiyun> & {
  auth: string
  token?: string
  phone?: string
  platform?: string
}

export async function main(index: number, config: Config, option?: { pushData: any }) {
  config = {
    ...config,
    ...getAuthInfo(config.auth),
  }

  if (config.phone.length !== 11 || !config.phone.startsWith('1')) {
    console.info(`auth 格式解析错误，请查看是否填写正确的 auth`)
    return
  }

  const cookieJar = createCookieJar()
  const logger = createLogger({ pushData: option && option.pushData })
  const baseUA =
    'Mozilla/5.0 (Linux; Android 13; 22041216C Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/121.0.6167.178 Mobile Safari/537.36'

  const DATA: M['DATA'] = {
    baseUA,
    mailUaEnd: '(139PE_WebView_Android_10.2.2_mcloud139)',
    mailRequested: 'cn.cj.pe',
    mcloudRequested: 'com.chinamobile.mcloud',
  }

  logger.info(`--------------`)
  logger.info(`你好：${config.phone}`)

  let jwtToken: string

  const headers = {
    'user-agent': DATA.baseUA,
    'x-requested-with': DATA.mcloudRequested,
    'charset': 'utf-8',
    'content-type': 'application/json;charset=UTF-8',
    'accept': 'application/json',
  }

  function getHeaders(url: string) {
    if (['caiyun.feixin.10086.cn', 'mrp.mcloud.139.com'].includes(getHostname(url))) {
      if (jwtToken) {
        return {
          ...headers,
          cookie: cookieJar.getCookieString(),
          jwttoken: jwtToken,
        }
      }
    }
    return {
      ...headers,
      authorization: config.auth,
    }
  }

  const http = createRequest({
    hooks: {
      beforeRequest(options) {
        options.headers = getHeaders(options.url)
        return options
      },
    },
  })

  const $: M = {
    api: createApi(http),
    logger: logger as any,
    DATA,
    sleep: Time.sleep,
    config: {
      shake: {
        num: 15,
        delay: 2,
      },
      catalog: '00019700101000000001',
      是否打印今日云朵: true,
      剩余多少天刷新token: 10,
      微信抽奖: {
        次数: 1,
        间隔: 500,
      },
      云朵大作战: {
        目标排名: 500,
        开启兑换: false,
        邀请用户: [],
      },
      ...config,
    } as any,
    gardenApi: createGardenApi(http),
    store: {},
    localStorage: undefined,
    md5,
  }

  jwtToken = await getJwtToken($)
  if (!jwtToken) return

  await run($)

  return await createNewAuth($)
}

// 获取当前工作表的使用范围
const sheet = Application.Sheets.Item('移动云盘') || Application.Sheets.Item('caiyun') || ActiveSheet
const usedRange = sheet.UsedRange
const AColumn = sheet.Columns('A')
const len = Number(usedRange.Row) + usedRange.Rows.Count - 1,
  BColumn = sheet.Columns('B')
const pushData = [{ type: 'info', date: new Date(), msg: '唯一发布地址：https://as.js.cool' }]

for (let i = 1; i <= len; i++) {
  const cell = AColumn.Rows(i)
  if (cell.Text) {
    console.log(`执行第 ${i} 行`)
    runMain(i, cell)
    console.log(`第 ${i} 行执行结束`)
  }
}

sendWpsNotify(pushData, getPushConfig())

function runMain(i: number, cell: { Text: string }) {
  try {
    const newAuth = main(
      i,
      {
        auth: cell.Text.length === 11 ? BColumn.Rows(i).Text : cell.Text,
      },
      {
        pushData,
      },
    )
    if (newAuth) {
      console.log(`更新 auth 成功`)
      ;(cell.Text.length === 11 ? BColumn.Rows(i) : AColumn.Rows(i))['Value'] = newAuth
    }
  } catch (error) {
    console.log(error.message)
  }
}
