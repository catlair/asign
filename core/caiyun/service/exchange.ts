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

async function getExchangeList($: M) {
  return Object.entries(await request($, $.api.exchangeList, { name: '获取兑换列表', isArray: true })).flatMap(x =>
    x[1]
  )
}

export async function exchangeApi($: M, prizeId: number, prizeName?: string) {
  try {
    const { code, msg } = await $.api.exchange(prizeId)
    if (code === 0) {
      $.logger.success(`兑换${prizeName}成功，请在本月底之前手动领取`)
      return true
    }

    if (code === 2301) {
      $.logger.fail(`本月已经兑换过了`)
      return
    }
    $.logger.fail(`兑换${prizeName}失败，${code}，${msg}`)
  } catch (error) {
    $.logger.error('兑换' + prizeName, error)
  }
}

async function exchange(
  $: M,
  prizeId: number,
  { prizeName, pOrder, limit, dailyRemainderCount }: Awaited<ReturnType<typeof getExchangeList>>[number],
) {
  if (limit === 2) {
    $.logger.info(`${prizeName}，本月已经兑换过了`)
    return
  }
  if (limit === 4) {
    $.logger.info(`${prizeName}，本月本组已兑换，下月再来`)
    return
  }
  if (dailyRemainderCount <= 0) {
    $.logger.info(`${prizeName}，今日已经兑换完`)
    return
  }
  if ($.store.totalCloud < pOrder) {
    $.logger.fail(`${prizeName}，云朵可能不够哦`)
    return
  }

  $.logger.debug(`${prizeName}，开始兑换`)

  return await exchangeApi($, prizeId, prizeName)
}
