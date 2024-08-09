import { randomHex, sleepSync } from '@asign/utils-pure'
import { getFileList } from '../api/file.js'
import { SKIP_TASK_LIST, TASK_LIST } from '../constant/taskList.js'
import { uploadRandomFile } from '../service/index.js'
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
  if (task.id === 434) {
    $.store.shareCount = getShareCount(task.name)
    $.logger.debug('shareCount', $.store.shareCount)
  }

  switch (task.groupid) {
    case 'beiyong1': {
      await _handleClick($, task, doingList)
      // 如果是上传任务，则主动上传
      if (task.name.includes('上传') && (task.name.includes('图') || task.name.includes('照'))) {
        $.logger.debug('尝试完成', task.name)
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

function getShareCount(str: string) {
  return +str.replace(`分享文件有好礼<span id='share_title'>`, '').replace('/7</span>', '')
}

function printShareCount($: M, name: string) {
  const count = getShareCount(name)
  if (count > $.store.shareCount) {
    $.logger.success('分享文件有好礼', count, '天')
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

  const skipCheck = [1021]

  if (doingList.length <= 0) return

  for (const task of await getAllAppTaskList($)) {
    if (skipCheck.includes(task.id)) continue
    // 分享文件有好礼
    if (task.id === 434) {
      printShareCount($, task.name)
      continue
    }
    // 七夕
    if (task.id === 481 && task.currstep === 2) {
      await clickTask($, 481, 'randomCloudTask')
      return true
    }
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
    106: uploadRandomFile,
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

async function _getFileList($: M) {
  try {
    const { message, code, data, success } = await getFileList($.http)
    if (success) {
      $.logger.debug(`测试 file/list`)
      return data.items.filter(item => item.type === 'file')
    }
    if (code === '04510001') return false
    $.logger.fail(`获取文件列表失败`, code, message)
  } catch (error) {
    $.logger.error(`获取文件列表异常`, error)
  }
}

async function getShareFile($: M) {
  const files = await _getFileList($)
  if (files) {
    const file = files.find(item => item.name === '中国移动云盘产品手册.pdf') || files[0]
    return file && file.fileId
  }
  return $.config.tasks.shareFile || $.store.files?.[0]
}

async function delShareFile($: M, linkIDs: string[]) {
  try {
    const { code, message, data } = await $.api.delOutLink($.config.phone, linkIDs)
    if (code === '0') {
      $.logger.debug(`删除分享成功`, message)
      return true
    }
    $.logger.debug(`分享文件失败`, code, message, data.result)
  } catch (error) {
    $.logger.debug(`删除分享文件失败`, error)
  }
}

async function shareTime($: M) {
  try {
    const shareFile = await getShareFile($)
    if (!shareFile) {
      $.logger.debug(`未获取到文件列表，跳过分享任务`)
      return
    }
    $.logger.debug('分享', shareFile)
    const { code, message, data } = await $.api.getOutLink(
      $.config.phone,
      [shareFile],
      '',
    )
    if (code === '0') {
      $.logger.success(`分享文件成功`, message)
      try {
        await delShareFile($, [data.getOutLinkRes.getOutLinkResSet[0].linkID])
      } catch {}
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

async function clickTask($: M, id: number, taskStr?: string) {
  try {
    const { code, msg, result } = await $.api.clickTask(id, taskStr)
    if (code === 0) {
      if (result && result.msg) $.logger.info(id, result.msg)
      return true
    }

    $.logger.fail(`点击任务${id}失败`, msg)
  } catch (error) {
    $.logger.error(`点击任务${id}异常`, error)
  }
  return false
}
