import { md5 } from '@asunajs/utils'
import * as api from '../api/cloud-day'
import type { M } from '../types'

export async function getCloudDayList({ logger, http }: M) {
  try {
    const { code, msg, result } = await api.getCloudDayList(http)
    if (code === 0) {
      return result.nationalPrizeList
    }
    logger.fatal('获取会员日列表失败', code, msg)
  } catch (error) {
    logger.error('获取会员日列表异常', error)
  }
  return []
}

export async function verifyCloudDay({ logger, http }: M, prizeId: number | string) {
  try {
    const { code, msg } = await api.verifyCloudDay(http, prizeId)

    if (code === 0) {
      logger.info('验证会员日礼物成功，因该可以兑换')
      return true
    }

    logger.fatal('验证会员日礼物失败', code, msg)
  } catch (error) {
    logger.error('验证会员日礼物异常', error)
  }
}

export async function getSmsVerCode({ logger, http }: M, prizeId: number | string) {
  try {
    const { code, msg } = await api.getSmsVerCode(http, prizeId)

    if (code === 0) {
      logger.success('验证码发送成功！')
      return true
    }

    logger.fatal('验证码发送失败', code, msg)
  } catch (error) {
    logger.error('验证码发送异常', error)
  }
}

export async function receiveCloudDayGift({ logger, http }: M, prizeId: number | string, smsCode: number | string) {
  try {
    const { code, msg } = await api.receiveCloudDayGift(http, prizeId, md5(String(smsCode)))

    if (code === 0) {
      logger.success('礼物领取成功！')
      return true
    }

    logger.fatal('礼物领取失败', code, msg)
  } catch (error) {
    logger.error('礼物领取异常', error)
  }
}
