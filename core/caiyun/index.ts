import { aiCloudTask } from './service/ai-cloud.js'
import { appTask } from './service/app.js'
import { backupGiftTask } from './service/backup-gift.js'
import { blindboxTask } from './service/blind-box.js'
import { cloudPhoneRedpackTask } from './service/cloud-phone-redpack.js'
import { gardenTask } from './service/garden.js'
import { aiRedPackTask } from './service/index.js'
import { msgPushOnTask } from './service/msg-push.js'
import { printTodayCloud } from './service/print-today-cloud.js'
import { shareFindTask } from './service/share.js'
import { receive, signIn, signInWx, wxDraw } from './service/sign.js'
import { taskExpansionTask } from './service/task-expansion.js'
import type { M } from './types.js'
import { request } from './utils/index.js'

export * from './api.js'
export { createNewAuth, getJwtToken } from './service/auth.js'
export { exchangeApi, exchangeTask } from './service/exchange.js'
export type * from './types.js'

export async function deleteFiles($: M, ids: string[]) {
  try {
    $.logger.debug(`删除文件${ids.join(',')}`)
    const {
      data: {
        createBatchOprTaskRes: { taskID },
      },
    } = await $.api.createBatchOprTask($.config.phone, ids)

    await $.api.queryBatchOprTaskDetail($.config.phone, taskID)
  } catch (error) {
    $.logger.error(`删除文件失败`, error)
  }
}

async function shake($: M) {
  const { shakePrizeconfig, shakeRecommend } = await request(
    $,
    $.api.shake,
    '摇一摇',
  )
  if (shakeRecommend) {
    return $.logger.debug(shakeRecommend.explain || shakeRecommend.img)
  }
  if (shakePrizeconfig) return $.logger.info(shakePrizeconfig.title + shakePrizeconfig.name)
}

async function shakeTask($: M) {
  $.logger.start('------【摇一摇】------')
  const { delay, num } = $.config.shake
  for (let index = 0; index < num; index++) {
    await shake($)
    if (index < num - 1) {
      await $.sleep(delay * 1000)
    }
  }
}

async function hc1Task($: M) {
  $.logger.start('------【合成芝麻】------')
  try {
    if ($.config.inviter) {
      $.logger.info('不支持邀请好友，跳过执行')
      return
    }
    const { info } = await request($, $.api.getHecheng1T, '获取合成芝麻')

    for (let index = 0; index < info.curr; index++) {
      await request($, $.api.beinviteHecheng1T, '合成芝麻开始')
      await $.sleep(5000)
      await request($, $.api.finishHecheng1T, '合成芝麻完成')
    }

    $.logger.success('完成合成芝麻')
  } catch (error) {
    $.logger.error('合成芝麻失败', error)
  }
}

async function afterTask($: M) {
  await printTodayCloud($)

  $.logger.debug('------【搽屁股】------')
  // 删除文件
  try {
    if ($.store && $.store.files) {
      return (await deleteFiles($, $.store.files))
    }
    $.logger.debug('你没有屁,,,,不是, 您还没拉呢')
  } catch (error) {
    $.logger.error('afterTask 异常', error)
  }
}

export const tasks = {
  appTask,
  backupGiftTask,
  blindboxTask,
  hc1Task,
  msgPushOnTask,
  receive,
  shakeTask,
  shareFindTask,
  aiRedPackTask,
  aiCloudTask,
  signIn,
  signInWx,
  taskExpansionTask,
  wxDraw,
  gardenTask,
  cloudPhoneRedpackTask,
  afterTask,
}

export async function run($: M) {
  const { config } = $

  const taskList = [
    signIn,
    taskExpansionTask,
    signInWx,
    wxDraw,
    appTask,
    shareFindTask,
    blindboxTask,
    hc1Task,
    shakeTask,
    receive,
    msgPushOnTask,
    backupGiftTask,
  ]

  if (config) {
    if (config.garden && config.garden.enable) {
      taskList.push(gardenTask)
    }

    if (config.aiRedPack && config.aiRedPack.enable) {
      taskList.push(aiRedPackTask)
      taskList.push(aiCloudTask)
    }

    if (config.cloudPhoneRedpack && config.cloudPhoneRedpack.enable) {
      taskList.push(cloudPhoneRedpackTask)
    }
  }

  for (const task of taskList) {
    await task($)
    await $.sleep(1000)
  }

  await afterTask($)
}
