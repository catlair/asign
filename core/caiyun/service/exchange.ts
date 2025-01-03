import type { M } from '../types.js'
import { request } from '../utils/index.js'

export async function exchangeTask($: M, prizeIds: number[]) {
  $.logger.start(`------【兑换月卡】------`)
  let result: string
  try {
    if (!prizeIds || !prizeIds.length) return

    const list = await getExchangeList($)
    for (const prizeId of prizeIds) {
      const item = list.find(x => x.prizeId === prizeId)
      if (await exchange($, prizeId, item)) {
        result = `兑换${item.prizeName}成功`
      }
      await $.sleep(300)
    }
  } catch (error) {
    $.logger.error('兑换月卡', error)
  }
  return result
}

export async function getExchangeList($: M) {
  return Object.entries(await request($, $.api.exchangeList, { name: '获取兑换列表', isArray: true })).flatMap(x =>
    x[1]
  )
}

export async function exchangeApi($: M, prizeId: number | string, prizeName?: string, smsCode?: string) {
  try {
    const { code, msg } = await $.api.exchange(prizeId, smsCode)
    if (code === 0) {
      $.logger.success(`兑换${prizeName}成功，第三方会员请在本月底之前手动领取`)
      return true
    }

    if (code === 2301) {
      $.logger.fail(`本月已经兑换过了`)
      return
    }
    if (code === 610) {
      $.logger.warn(`兑换${prizeName}失败，${code}，${msg}，请手动登录 APP 后重试`)
      return
    }
    $.logger.fail(`兑换${prizeName}失败，${code}，${msg}`)
  } catch (error) {
    $.logger.error('兑换' + prizeName, error)
  }
}

export function checkExchange(
  { logger, store }: M,
  { prizeName, pOrder, limit, dailyRemainderCount, count }: Awaited<ReturnType<typeof getExchangeList>>[number],
) {
  if (limit === 2) {
    logger.info(`${prizeName}，本月已经兑换过了`)
    return
  }
  if (limit === 4) {
    logger.info(`${prizeName}，本月本组已兑换，下月再来`)
    return
  }
  if (dailyRemainderCount <= 0) {
    logger.info(`${prizeName}，今日已经兑换完`)
    return
  }
  if (count <= 0) {
    logger.info(`${prizeName}，本年度已经兑换完`)
    return
  }
  if (store.totalCloud < pOrder) {
    logger.fail(`${prizeName}，云朵可能不够哦`)
    return
  }
  return true
}

export async function exchange(
  $: M,
  prizeId: number,
  item: Awaited<ReturnType<typeof getExchangeList>>[number],
  smsCode = '',
) {
  if (!checkExchange($, item)) return

  const details = await getReceivePrizeDetails($, prizeId)

  if (details && details.verifycode === 0) {
    $.logger.fail('需要短信验证')
    return
  }

  $.logger.debug(`${item.prizeName}，开始兑换`)

  return await exchangeApi($, prizeId, item.prizeName, smsCode)
}

export async function getReceivePrizeDetails($: M, prizeId: number) {
  try {
    const { code, msg, result } = await $.api.receivePrizeDetails(prizeId)
    if (code === 0) {
      return result
    }

    $.logger.fail(`获取领取奖品详情失败，${code}，${msg}`)
  } catch (error) {
    $.logger.error('获取领取奖品详情异常', error)
  }
}

export async function getSmsVerCode({ logger, api }: M, prizeId: number | string) {
  try {
    const { code, msg } = await api.getVerCode(prizeId)

    if (code === 0) {
      logger.success('验证码发送成功！')
      return true
    }

    logger.fatal('验证码发送失败', code, msg)
  } catch (error) {
    logger.error('验证码发送异常', error)
  }
}
