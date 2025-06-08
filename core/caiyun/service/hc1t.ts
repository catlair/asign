import type { LoggerType } from '@asign/types'
import { randomNumber } from '@asign/utils-pure'
import { createRequest } from '@asunajs/http'
import { getSignHeader } from '@asunajs/utils'
import type { Journaling } from '../api'
import { encryptDataLogin } from '../api/auth'
import { reqAction } from '../api/tools'
import type { M } from '../types'
import type { Hecheng1T } from '../types/hc1t'
import { request } from '../utils'

export async function hc1Task($: M) {
  const { logger, config, api } = $
  logger.start('------【云朵大作战】------')
  try {
    await loginHecheng1T($)

    const data = await request($, api.getHecheng1T, '获取云朵大作战')

    printHc1t(logger, data)

    if (config.云朵大作战?.邀请用户?.length) {
      return logger.info('不支持邀请好友，跳过执行（因为你配置了邀请好友，默认你单独运行云朵大作战）')
    }

    const 游戏时间 = $.config.云朵大作战.游戏时间

    for (let index = 0; index < data.info.curr; index++) {
      await hc1tHandler($, 游戏时间)
    }

    logger.success('完成云朵大作战')
  } catch (error) {
    logger.error('云朵大作战失败', error)
  }
}

async function callJournaling($: M, optkeyword: Journaling) {
  try {
    await $.api.journaling(optkeyword, '1005')
    await $.sleep(randomNumber(50, 200))
  } catch (error) {
    $.logger.debug('调用journaling失败', optkeyword, error)
  }
}

export async function hc1tHandler($: M, 游戏时间: number, inviter?: string) {
  await encryptDataLogin($.http)

  await callJournaling($, 'synthesisonet_pv')
  await callJournaling($, 'synthesisonet_cookie')
  await callJournaling($, 'synthesisonet_cookie_notApp')

  await callJournaling($, 'synthesisonet_inviterUserPlayGame')
  await callJournaling($, 'synthesisonet_playGame')
  await callJournaling($, 'synthesisonet_playGame_isOts')

  await request($, $.api.beinviteHecheng1T, '开始游戏', await getSignTimestamp($), inviter)
  $.logger.debug('云朵大作战游戏开始，等待游戏结束中', 游戏时间)

  const count = Math.ceil(游戏时间 / 3)
  for (let index = 0; index < count; index++) {
    await tap()
  }
  await callJournaling($, 'synthesisonet_finish_gameSuc')

  await request($, $.api.finishHecheng1T, '游戏结束', await getSignTimestamp($))
  $.logger.debug('云朵大作战游戏结束')

  async function tap() {
    await callJournaling($, 'synthesisonet_game_tap')
    await $.sleep(3 * randomNumber(990, 1010))
  }
}

export async function loginHecheng1T($: M) {
  const http = createRequest()

  const specToken = await $.http.post('https://user-njs.yun.139.com/user/querySpecToken', {
    toSourceId: '001005',
  })

  const loginInfo = await http.get(
    `https://caiyun.feixin.10086.cn/portal/auth/v2/tyrzLogin.action?ssoToken=${specToken.data.token}&openAccount=0&channel=&marketName=hecheng1T&sourceId=1169`,
    {
      headers: getSignHeader(
        new Date().getTime(),
        2,
        `ssoToken=${specToken.data.token}&openAccount=0&channel=&marketName=hecheng1T&sourceId=1169`,
      ),
    },
  )

  if (loginInfo.code !== 0) {
    throw new Error(`登录云朵大作战失败: ${loginInfo.msg} (code: ${loginInfo.code})`)
  }

  http.setHeader('jwttoken', loginInfo.result.token)

  return { ...$, http }
}

export async function getSignTimestamp({ logger, http }: M) {
  try {
    const { msg, result, code } = await reqAction(http, 'currentTimeMillis')
    if (result) return result
    logger.debug('获取时间戳失败', code, msg)
  } catch (error) {
    logger.debug('获取时间戳异常', error)
  }
  return new Date().getTime()
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
  logger.debug(
    '最后成功时间',
    lastSucc ? new Date(lastSucc).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '无记录',
  )
}
