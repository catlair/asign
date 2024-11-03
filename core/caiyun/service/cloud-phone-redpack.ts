import { createTime, isNullish, randomString } from '@asign/utils-pure'
import * as api from '../api/cloud-phone-redpack'
import type { M } from '../types'

type Md5 = (str: string) => string

export function getHeader(md5: Md5, token: string) {
  const appId = '12345681'
  const requestId = createTime() + Date.now() + randomString(8)
  const timestamp = Date.now()

  return {
    sign: getSign(md5, { requestId, appId, token }, timestamp),
    requestId,
    appId,
    token,
    timestamp: String(timestamp),
  }
}

function getSign(md5: Md5, params: Record<string, any>, timestamp: number | string) {
  const code = 'e10adc3949ba59abbe56e057f20f883e'

  const paramsStr = Object.values(params).reduce(
    (acc, value) =>
      acc + (isNullish(value)
        ? ''
        : typeof value === 'object'
        ? JSON.stringify(value)
        : value),
    '',
  )

  return md5(paramsStr + code + timestamp).toLowerCase()
}

export async function cloudPhoneRedpackTask($: M) {
  $.logger.start(`------【云手机红包派对】------`)
  try {
    await login($)
    if (!$.store?.cloudPhoneToken) {
      $.logger.error('云手机红包派对', '登录失败')
      return
    }

    await printUser($)

    await $.sleep(1000)

    await sign($)
  } catch (error) {
    $.logger.error('云手机红包派对', error)
  }
}

async function getConfigTaskList({ http, logger, md5, store }: M) {
  try {
    const { header, data } = await api.configTaskList(http, getHeader(md5, store.cloudPhoneToken))
    if (header.status !== '200') {
      logger.error('getConfigTaskList 失败', header)
      return
    }

    return data
  } catch (error) {
    logger.error('getConfigTaskList', error)
  }
}

async function sign($: M) {
  const task = await getConfigTaskList($)
  if (!task) return
  const { configTaskSignList } = task

  const today = configTaskSignList.find(({ isToday }) => isToday === 1)
  if (!today) {
    $.logger.fail('未找到今日签到任务')
    return
  }

  if (today.status === 0) {
    $.logger.success('今日已签到')
    return
  }

  const status = await userSign($)
  if (status === 1) {
    $.logger.success('签到成功', '获得', today.signAmount, '分')
  } else {
    $.logger.fail('签到失败', status)
  }
}

async function login($: M) {
  try {
    const tyrzToken = await getTyrzToken($)
    if (!tyrzToken) return
    const token = await tokenValidate($, tyrzToken)
    if (!token) return
    $.store = {
      ...$.store,
      cloudPhoneToken: token,
    }
  } catch (error) {
    $.logger.error('login 异常', error)
  }
}

async function getTyrzToken({ logger, http }: M) {
  try {
    const { desc, retCode, token } = await api.getTyrzToken(http)
    if (retCode === '0' && token) {
      return token
    }
    logger.error('getTyrzToken 失败', retCode, desc)
  } catch (error) {
    logger.fatal('getTyrzToken 异常', error)
  }
}

async function tokenValidate({ logger, http, md5 }: M, token: string) {
  try {
    const { header, data } = await api.tokenValidate(http, token, getHeader(md5, ''))
    if (header.status !== '200') {
      logger.error('tokenValidate 失败', header)
      return
    }
    return data.token
  } catch (error) {
    logger.fatal('getTyrzToken 异常', error)
  }
}

async function userSign({ logger, http, md5, store }: M) {
  try {
    const { header, data } = await api.userSign(http, getHeader(md5, store.cloudPhoneToken))
    if (header.status !== '200') {
      logger.error('tokenValidate 失败', header)
      return
    }
    return data.status
  } catch (error) {
    logger.error('sign', error)
  }
}

async function getUserAccount({ logger, http, md5, store }: M) {
  try {
    const { header, data } = await api.userAccountInfo(http, getHeader(md5, store.cloudPhoneToken))
    if (header.status !== '200') {
      logger.error('getUserAccount 失败', header)
      return
    }
    return data.info
  } catch (error) {
    logger.error('getUserAccount', error)
  }
}

async function printUser($: M) {
  const user = await getUserAccount($)
  if (!user) {
    $.logger.fail('获取用户信息失败')
    return
  }

  $.logger.info('可使用积分：', user.canAmount)
}
