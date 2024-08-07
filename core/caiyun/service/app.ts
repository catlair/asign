import { randomHex, setStoreArray, sleepSync } from '@asign/utils-pure'
import { SKIP_TASK_LIST, TASK_LIST } from '../constant/taskList.js'
import { pcUploadFileRequest, uploadRandomFile } from '../service/index.js'
import type { TaskList } from '../TaskType.js'
import type { M } from '../types'
import { getGroupName, getMarketName, request } from '../utils/index.js'
import { refreshToken } from './auth.js'

type TaskItem = TaskList['result'][keyof TaskList['result']][number]

async function _handleClick($: M, task: TaskItem, doingList: number[]) {
  if (await _clickTask($, task.id, task.currstep)) {
    await _handleAppTask($, task)
    doingList.push(task.id)
    await $.sleep(500)
  }
}

async function _switchAppTask($: M, task: TaskItem, doingList: number[]) {
  switch (task.groupid) {
    case 'beiyong1': {
      await _handleClick($, task, doingList)
      // 如果是上传任务，则主动上传
      if (task.name.includes('上传') && (task.name.includes('图') || task.name.includes('照'))) {
        await uploadRandomFile($)
        return
      }
    }
    case 'month': {
      // 在没开启备份的前提下，本月 20 号前不做 app 的月任务
      if (task.marketname === 'sign_in_3' && ($.store.curMonthBackup === false && new Date().getDate() < 20)) {
        $.logger.debug('跳过任务（未开启备份）', task.name)
        return
      }
    }
    default: {
      if (TASK_LIST[task.id]) {
        await _handleClick($, task, doingList)
        return
      }
      if (!SKIP_TASK_LIST.includes(task.id)) {
        await clickTask($, task.id)
        return
      }
    }
  }
}

export async function appTask($: M) {
  $.logger.start('------【任务列表】------')
  const taskList = await getAllAppTaskList($)

  const doingList: number[] = []

  // 后续可能有的任务需要主动排序
  taskList.sort((a, b) => a.id - b.id)

  for (const task of taskList) {
    // 强制跳过任务
    if ($.config.tasks?.skipTasks?.includes(task.id)) continue
    if (task.state === 'FINISH' || task.enable !== 1) continue

    await _switchAppTask($, task, doingList)
  }

  const skipCheck = [434, 1021]

  if (doingList.length <= 0) return

  for (const task of await getAllAppTaskList($)) {
    if (skipCheck.includes(task.id)) continue
    const printFail = (msg: string) =>
      $.logger.fail(
        msg,
        `请前往${getMarketName(task.marketname)}手动完成${getGroupName(task.groupid)}：${task.name}(${task.id})`,
      )

    if (doingList.includes(task.id)) {
      if (task.state === 'FINISH') {
        $.logger.success('成功', task.name)
        continue
      }
      printFail('失败')
      continue
    }
    if (task.groupid === 'month' || task.groupid === 'day') {
      if (task.state !== 'FINISH') {
        printFail('未完成')
      }
    }
  }
}

async function _handleAppTask($: M, task: TaskItem) {
  const taskRunner = getTaskRunner($)

  switch (task.id) {
    case 110:
      return await taskRunner[task.id]?.($, task.process)
    default:
      return await taskRunner[task.id]?.($, task)
  }
}

function getTaskRunner($: M) {
  return {
    113: async ($: M) => {
      await refreshToken($)
      sleepSync(1000)
      await uploadRandomFile($)
    },
    106: uploadFileDaily,
    107: createNoteDaily,
    434: shareTime,
    110: $.node && $.node.uploadTask,
    1021: emailNotice,
  }
}

async function getAllAppTaskList($: M) {
  const list1 = await getAppTaskList($, 'sign_in_3')
  const list2 = await getAppTaskList($, 'newsign_139mail')

  return list1.concat(list2)
}

async function emailNotice($: M, task: TaskItem) {
  try {
    const { out } = task.button
    if (!out) return
    if (out.canReceive === 1) {
      $.logger.debug(`可以领取通知奖励`, task.id)
      await request($, $.api.receiveTask, '领取邮件通知奖励', task.id)
      return
    }
    out.day && $.logger.debug(`邮箱通知已经开启`, out.day, '天')
  } catch (error) {
    $.logger.error(`邮件通知异常`, error)
  }
}

async function getAppTaskList($: M, marketname: 'sign_in_3' | 'newsign_139mail' = 'sign_in_3') {
  const data = await request(
    $,
    $.api.getTaskList,
    '获取任务列表',
    marketname,
  )

  return Object.values(data).flat()
}

async function uploadFileDaily($: M) {
  const contentID = await pcUploadFileRequest($, $.config.catalog)
  if (contentID) {
    setStoreArray($.store, 'files', contentID)
  }
}

async function createNoteDaily($: M) {
  if (!$.config.auth) {
    $.logger.info(`未配置 authToken，跳过云笔记任务执行`)
    return
  }
  const headers = await getNoteAuthToken($)
  if (!headers) {
    $.logger.info(`获取鉴权信息失败，跳过云笔记任务执行`)
    return
  }
  try {
    const id = randomHex(32)
    await $.api.createNote(id, `${randomHex(3)}`, $.config.phone, headers)
    await $.sleep(2000)
    await $.api.deleteNote(id, headers)
  } catch (error) {
    $.logger.error(`创建云笔记异常`, error)
  }
}

async function _clickTask($: M, id: number, currstep = 0) {
  const idCurrstepMap = {
    434: 22,
  }
  if (idCurrstepMap[id] && currstep === idCurrstepMap[id]) {
    await clickTask($, id)
    return true
  }
  return currstep === 0 ? await clickTask($, id) : true
}

async function shareTime($: M) {
  try {
    const shareFile = $.config.tasks.shareFile
    const files = shareFile ? [shareFile] : $.store.files
    if (!files || !files[0]) {
      $.logger.debug(`未获取到文件列表，跳过分享任务（不是错误，再反馈拉黑了）`)
      return
    }
    $.logger.debug('分享', files[0])
    const { code, message, data } = await $.api.getOutLink(
      $.config.phone,
      [files[0]],
      '',
    )
    if (code === '0') {
      $.logger.success(`分享文件成功`, message)
      return true
    }
    $.logger.fail(`分享文件失败`, code, message, data.result)
  } catch (error) {
    $.logger.error(`分享文件异常`, error)
  }
}

async function getNoteAuthToken($: M) {
  try {
    return $.api.getNoteAuthToken($.config.auth, $.config.phone)
  } catch (error) {
    $.logger.error('获取云笔记 Auth Token 异常', error)
  }
}

async function clickTask($: M, task: number) {
  try {
    const { code, msg } = await $.api.clickTask(task)
    if (code === 0) {
      return true
    }
    $.logger.fail(`点击任务${task}失败`, msg)
  } catch (error) {
    $.logger.error(`点击任务${task}异常`, error)
  }
  return false
}
