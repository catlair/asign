import type { LoggerType } from '@asign/types'
import type { M } from '../types'
import type { Hecheng1T } from '../types/hc1t'
import { request } from '../utils'

export async function hc1Task($: M) {
  $.logger.start('------【云朵大作战】------')
  try {
    if ($.config.云朵大作战 && $.config.云朵大作战.邀请用户) {
      $.logger.info('不支持邀请好友，跳过执行')
      return
    }
    const data = await request($, $.api.getHecheng1T, '获取云朵大作战')

    printHc1t($.logger, data)

    for (let index = 0; index < data.info.curr; index++) {
      await request($, $.api.beinviteHecheng1T, '云朵大作战开始')
      await $.sleep(5000)
      await request($, $.api.finishHecheng1T, '云朵大作战完成')
    }

    $.logger.success('完成云朵大作战')
  } catch (error) {
    $.logger.error('云朵大作战失败', error)
  }
}

export function printHc1t(logger: LoggerType, { info, history }: Hecheng1T['result']) {
  const { invite, exchange, succ, lastSucc, curr } = info
  const { count, rank } = history[0]
  const 上个月 = history[-1]
  if (上个月) {
    logger.debug('上个月排名', 上个月.rank)
    logger.debug('上个月完成次数', 上个月.count)
  }
  logger.debug('本月排名', rank)
  logger.debug('本月成功次数', count || succ)
  logger.debug('今日剩余次数', curr)
  logger.debug('今日可兑换次数', exchange)
  logger.debug('今日可被邀请次数', invite)
  logger.debug('最后成功时间', lastSucc)
}
