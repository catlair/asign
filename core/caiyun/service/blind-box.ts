import { createRequest } from '@asunajs/http'
import { getSignHeader } from '@asunajs/utils'
import type { M } from '../types'
import { request } from '../utils/index.js'
async function openBlindbox($: M) {
  try {
    $.logger.debug('开盲盒')
    const { code, msg, result } = await $.api.openBlindbox()
    switch (code) {
      case 0:
        return $.logger.info('获得', result.prizeName)
      case 200103:
        return $.logger.fail('本月奖励已领完', code, msg)
      case 200105:
        return $.logger.debug('什么都没有哦')
      case 200106:
        return $.logger.error('异常', code, msg)
      default:
        return $.logger.warn('未知原因失败', code, msg)
    }
  } catch (error) {
    $.logger.error('openBlindbox 异常', error)
  }
}

async function openBlindboxAfterGetCount($: M) {
  try {
    const { chanceNum } = await request($, $.api.blindboxUser, '获取盲盒任务')
    if (!chanceNum) return
    await $.sleep(666)
    for (let i = 0; i < chanceNum; i++) {
      await openBlindbox($)
      await $.sleep(666)
    }
  } catch (error) {
    $.logger.error('开盒异常', error)
  }
}

async function registerBlindboxTask($: M, taskId: number) {
  await request($, $.api.registerBlindboxTask, '注册盲盒', taskId)
}

async function openMoreBlindbox($: M) {
  try {
    const taskList = await request($, $.api.getBlindboxTask, '获取盲盒任务')
    if (!Array.isArray(taskList)) return

    const tasks = taskList.filter(task => task.memo && !task.memo.includes('isLimit') && task.status === 0)

    if (tasks.length <= 0) {
      return
    }

    for (const { taskName, taskId } of tasks) {
      $.logger.debug('注册盲盒任务', taskName)
      await registerBlindboxTask($, taskId)
      await $.sleep(666)
      await openBlindboxAfterGetCount($)
    }
  } catch (error) {
    $.logger.error(error)
  }
}

async function blindboxJournaling({ api, sleep }: M) {
  await api.journaling('National_BlindBox_userLogin')
  await sleep(200)
  await api.journaling('National_BlindBox_login')
  await sleep(200)
  await api.journaling('National_BlindBox_loginAppOuterEnd')
  await sleep(200)
}

async function loginBlindBox($: M) {
  const http = createRequest()

  const specToken = await $.http.post('https://user-njs.yun.139.com/user/querySpecToken', {
    toSourceId: '001005',
  })

  if (specToken.code !== 0 && specToken.code !== '0000' && specToken.success !== true) {
    throw new Error(`获取 specToken 失败: ${specToken.msg || specToken.message}`)
  }

  const { var: { rmkey, sid } } = await $.api.loginMail(specToken.data.token)

  if (!rmkey || !sid) {
    throw new Error('登录失败，rmkey 或 sid 未获取到')
  }

  const artifact = await http.post(
    `https://smsrebuild1.mail.10086.cn/setting/s?func=umc:getArtifact&sid=${sid}&cguid=${new Date().getTime()}`,
    '',
    {
      headers: {
        COOKIE: `RMKEY=${rmkey}`,
      },
    },
  )

  if (!artifact.var?.artifact) {
    throw new Error(`获取 artifact 失败: ${artifact.msg}`)
  }

  const loginInfo = await http.get(
    `https://caiyun.feixin.10086.cn/portal/auth/v2/tyrzLogin.action?ssoToken=${artifact.var.artifact}&openAccount=0&channel=&marketName=National_BlindBox&sourceId=1005`,
    {
      headers: getSignHeader(
        new Date().getTime(),
        2,
        `ssoToken=${artifact.var.artifact}&openAccount=0&channel=&marketName=National_BlindBox&sourceId=1005`,
      ),
    },
  )

  if (loginInfo.code !== 0) {
    throw new Error(`登录盲盒失败: ${loginInfo.msg || loginInfo.message} (code: ${loginInfo.code})`)
  }

  http.setHeader('jwttoken', loginInfo.result.token)

  return { ...$, http }
}

export async function blindboxTask(_$: M) {
  _$.logger.start('------【开盲盒】------')
  let $: M
  try {
    $ = await loginBlindBox(_$)
  } catch (error) {
    _$.logger.error('登录异常', error)
    // $ = _$
    return
  }
  try {
    await blindboxJournaling($)
    const r1 = await request($, $.api.blindboxUser, '获取盲盒用户信息')
    if (typeof r1.chanceNum !== 'number') {
      $.logger.debug(r1.chanceNum)
      return await openBlindbox($)
    }
    if (r1.chanceNum === 0 && r1.taskNum >= 2) {
      $.logger.info('今日已完成')
      return
    }
    if (r1.firstTime) {
      $.logger.success('今日首次登录，获取次数 +1')
    }
    // 先完成一波
    for (let i = 0; i < r1.chanceNum; i++) {
      await openBlindbox($)
      await $.sleep(666)
    }
    await openMoreBlindbox($)
  } catch (error) {
    $.logger.error('开盲盒任务异常', error)
  }
}
