import type { Caiyun, M } from '@asign/caiyun-core'
import { hc1tHandler, loginHecheng1T, printHc1t } from '@asign/caiyun-core/service/hc1t'
import type { Hecheng1T } from '@asign/caiyun-core/types/hc1t'
import { getStorage } from '@asign/unstorage'
import { hidePhone } from '@asign/utils-pure'
import { createLogger, LoggerPushData } from '@asunajs/utils'
import { randomInt } from 'node:crypto'
import { init } from './utils'

const storage = getStorage('caiyun-hc1t')

const DB_KEY = 'invite'

async function exchangeHc1t($: M, time: number, rank: number) {
  if (rank < $.config.云朵大作战.目标排名) {
    $.logger.debug(`当前排名 ${rank}，优于配置排名 ${$.config.云朵大作战.目标排名}，不兑换`)
    return
  }
  if (!$.config.云朵大作战.开启兑换) {
    $.logger.debug(`未开启兑换，不兑换`)
    return
  }
  if (time <= 0) return
  try {
    const { code, msg, result } = await $.api.exchangeHecheng1T(time)
    if (code !== 0) {
      return $.logger.fail('兑换次数失败', code, msg)
    }
    const { inviteds, curr, invite } = result
    $.logger.debug('剩余次数', curr)
    $.logger.debug('今日剩余可被邀请次数', invite)
    $.logger.debug(
      '已被下列用户邀请过：',
      inviteds.filter(Boolean).map(i => hidePhone(i)).join('，'),
    )
  } catch (error) {
    $.logger.error('兑换异常', error)
  }
}

async function getHc1tApi($: M): Promise<Hecheng1T['result']> {
  try {
    const { code, msg, result } = await $.api.getHecheng1T()
    if (code === 0) {
      return result
    }

    $.logger.fatal('获取云朵大作战信息失败', msg)
  } catch (error) {
    $.logger.error('获取云朵大作战信息异常', error)
  }
  return {} as any
}

export async function getHc1t($: M) {
  const { info, history } = await getHc1tApi($)
  if (!info) {
    return {
      curr: 0,
      exchange: 0,
      rank: 1,
    }
  }

  printHc1t($.logger, { info, history })

  const { exchange, curr } = info

  return {
    curr,
    exchange,
    rank: Number(history[0].rank) || 1,
  }
}

async function hc1t($: M, inviter: string) {
  $.logger.start('开始云朵大作战，', inviter ? '接受' + hidePhone(inviter) + '邀请' : '未获取到可用配置或已使用完')
  try {
    const 游戏时间 = $.config.云朵大作战.游戏时间

    await hc1tHandler($, 游戏时间, inviter)

    await saveInviter(inviter, $.config.phone)
  } catch (error) {
    $.logger.error('云朵大作战失败', error)
  }
}

async function _do($: M, inviter: string) {
  await $.sleep(5000)
  $.logger.start('开始云朵大作战，', inviter ? '接受' + hidePhone(inviter) + '邀请' : '未获取到可用配置或已使用完')
  await hc1t($, inviter)
  await $.sleep(7000)
  return await getHc1t($)
}

async function hc1tTask($: M) {
  const config = $.config.云朵大作战
  if (!config) return $.logger.warn('云朵大作战未配置，跳过执行')

  const inviters = config.邀请用户
  if (!inviters || !inviters.length) return $.logger.warn('云朵大作战未配置邀请用户，跳过执行')

  try {
    await loginHecheng1T($)
  } catch (error) {
    $.logger.error('云朵大作战登录失败', error)
  }

  // @TODO: 兼容旧的 base64 配置
  inviters.forEach((item, i, arr) => (arr[i] = b64ToStr(item)))

  let data = await getHc1t($)

  const _run = async () => {
    const phone = $.config.phone
    for (let index = 0; index < data.curr; index++) {
      data = await _do($, await getInviter(inviters, phone))
      await $.sleep(3000)
    }
  }

  await _run()

  await exchangeHc1t($, data.exchange, data.rank)

  await _run()
}

export async function runHc1t(config: Caiyun, pushData?: LoggerPushData[]) {
  const logger = await createLogger({ pushData })
  const { $ } = await init(config, { logger })

  return await hc1tTask($)
}

function b64ToStr(b64: string | number) {
  if (typeof b64 !== 'string') return String(b64)
  return b64 && b64.startsWith('M') ? Buffer.from(b64, 'base64').toString('utf-8') : b64
}

type Used = { time: string; value: string[] }

export async function saveInviter(inviter: string, phone: string) {
  if (!inviter) return

  const used = (await storage.getItem(DB_KEY) || {}) as Record<string, Used>

  const today = new Date().toLocaleDateString('zh-CN')

  const { time, value } = used[phone] || { time: today, value: [] as string[] }

  // 如果今日运行过
  if (time === today) {
    value.push(inviter)
    used[phone] = { time, value }
  } else {
    used[phone] = { time: today, value: [inviter] }
  }
  await storage.setItem(DB_KEY, used)
}

export async function getSavedInviter(phone: string) {
  let used = (await storage.getItem(DB_KEY) || {}) as Record<string, Used>

  const time = new Date().toLocaleDateString('zh-CN')

  if (used[phone] && (used[phone].time === time)) {
    return used[phone].value
  }

  return []
}

export async function getInviter(inviters: string[], phone: string) {
  const savedInviters = await getSavedInviter(phone)

  // 从 inviters 中排除 savedInviters，再随机取一个
  const _inviters = inviters.filter(iStr => !savedInviters.includes(iStr) && iStr !== phone)
  if (_inviters.length === 0) return ''

  return _inviters[randomInt(0, _inviters.length)]
}
