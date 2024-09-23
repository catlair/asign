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

export async function blindboxTask($: M) {
  $.logger.start('------【开盲盒】------')
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
