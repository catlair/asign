import { isCurrentMonth, isWps, randomNumber } from '@asign/utils-pure'
import {
  type AiCloudPreOptions,
  type AiCloudRewardOptions,
  getCloudRewardApi,
  getPreCloudRewardApi,
} from '../api/ai-cloud'
import { DB_KEYS } from '../constant'
import type { M } from '../types'
import { request } from '../utils'
import { addDataNum, getDataNum, setDataNum } from '../utils/store'

export async function aiCloudTask($: M) {
  $.logger.start(`------【玩AI小天得云朵】------`)

  if (isWps()) {
    $.logger.fail('AI云朵', '当前环境为WPS，跳过')
    return
  }

  if (!$.store.aiSession || !$.store.aiSession.length) {
    $.logger.fail('AI云朵', '没有AI云朵对话记录,请确定AI红包任务已经运行')
    return
  }

  try {
    if (!$.config.userId) {
      $.logger.fatal('AI云朵', '获取用户ID失败')
      return
    }

    const userId = $.node.encryptAiUserId($.config.userId)

    let num = await getDataNum($, DB_KEYS.AI_CLOUND_NUM)

    if (!num) {
      await setDataNum($, DB_KEYS.AI_CLOUND_NUM, num = await getCloudRecordByAi($) || 0)
    }

    $.logger.info(`本月获取云朵数量: ${num}`)

    if (num > 250) return

    if (num >= 197) {
      return await addCloudNum($, { ...$.store.aiSession[0], userId })
    }

    for (let index = 0; index < 10; index++) {
      const data = $.store.aiSession[randomNumber(0, $.store.aiSession.length - 1)]
      await addCloudNum($, { ...data, userId })
      await $.sleep(2000)
    }
  } catch (error) {
    $.logger.error('AI红包', error)
  }
}

async function addCloudNum($: M, ops: AiCloudPreOptions) {
  return await addDataNum($, DB_KEYS.AI_CLOUND_NUM, await getCloudRewardRecord($, ops))
}

async function getCloudRewardRecord($: M, options: AiCloudPreOptions) {
  try {
    const recordId = await getPreCloudReward($, options)

    if (!recordId) return

    return await getCloudReward($, { userId: options.userId, recordId })
  } catch (error) {
    $.logger.error('AI云朵异常', error)
  }
}

async function getPreCloudReward({ http, logger }: M, options: AiCloudPreOptions) {
  try {
    const { code, msg, result } = await getPreCloudRewardApi(http, options)
    if (code === 52105) {
      return logger.debug('僵尸打开你的脑子，摇了摇头走了')
    }
    if (code !== 0) {
      logger.fail('抽取奖励失败', code, msg)
      return
    }

    logger.debug('抽取奖励成功, 抽取', result.cloudNum)

    return result.recordId
  } catch (error) {
    logger.error('抽取奖励异常', error)
  }
}

async function getCloudReward({ http, logger }: M, options: AiCloudRewardOptions) {
  try {
    const { msg, code, result } = await getCloudRewardApi(http, options)
    if (code !== 0) {
      logger.fail('领取奖励失败', code, msg)
      return
    }
    logger.success('领取奖励成功, 获取', result, '云朵')
    return result
  } catch (error) {
    logger.error('领取奖励异常', error)
  }
}

/**
 * 获取本月已经获得云朵数量
 */
async function getCloudRecordByAi($: M) {
  const records = await request($, $.api.getCloudRecord, '获取云朵记录', 1, 300)
  if (!records) return 0
  const list = records.records.filter(el => el.mark === ('PlayAiodd') && isCurrentMonth(el.inserttime))
  return list.reduce((acc, cur) => acc + cur.num, 0)
}
