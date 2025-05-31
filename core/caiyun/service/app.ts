import { randomHex, randomNumber, sleepSync } from '@asign/utils-pure'
import { getDisk, getFileList } from '../api/file.js'
import { SKIP_TASK_LIST, TASK_LIST } from '../constant/task-list.js'
import { uploadRandomFile } from '../service/index.js'
import type { TaskList } from '../task-type.js'
import type { M } from '../types'
import { getGroupName, getMarketName, request } from '../utils/index.js'
import { getNoteAuthToken, refreshToken } from './auth.js'

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
  return +str.replace(`分享文件得云朵<span id='share_title'>`, '').replace('/7</span>', '')
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
    }
    // 高价值用户专属福利
    if (task.id === 478 && task.state !== 'FINISH') {
      await clickTask($, 478, 'randomCloudTask')
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
      if (task.id === 522) {
        if (task.process === 0) printFail('失败')
        else $.logger.info(task.name, '本月已经完成', task.process, '次')
        continue
      }

      printFail('失败')
      continue
    }
    if (task.groupid === 'month' || task.groupid === 'day' || task.groupid === 'cloudEmail') {
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
    case 522:
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
      await uploadRandomFile($, { channelSrc: '10200153' })
    },
    106: ($: M) => uploadRandomFile($),
    107: createNoteDaily,
    434: shareTime,
    110: $.node && $.node.uploadTask,
    522: update100,
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

async function update100($: M, progressNum: number) {
  $.logger.info(`开始执行每月100次上传任务`)
  for (let i = 0; i < $.config.tasks.每月上传任务单日数量; i++) {
    if (progressNum >= 100) break
    await uploadRandomFile($)
    await $.sleep(500)
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
  if (!$.config.token) {
    $.logger.info(`未配置 authToken，跳过云笔记任务执行`)
    return
  }
  const { headers } = await getNoteAuthToken($)
  if (!headers || !headers.app_auth) {
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
      const list = data.items.filter(item => item.type === 'file')
      return list.map(item => ({
        name: item.name,
        id: item.fileId,
      }))
    }
    if (code === '04510001') return false
    $.logger.fail(`获取文件列表失败`, code, message)
  } catch (error) {
    $.logger.error(`获取文件列表异常`, error)
  }
}

async function _getFileList2($: M) {
  try {
    const { message, code, data, success } = await getDisk($.http, $.config.phone, $.config.catalog)
    if (success) {
      $.logger.debug(`测试 file/list`)
      const list = data.getDiskResult?.contentList
      return list.map(item => ({
        name: item.contentName,
        id: item.contentID,
      }))
    }
    if (code === '04510001') return false
    $.logger.fail(`获取文件列表失败`, code, message)
  } catch (error) {
    $.logger.error(`获取文件列表异常`, error)
  }
}

async function getShareFile($: M) {
  const files = $.config.文件获取方式 === 1 ? await _getFileList($) : await _getFileList2($)
  if (files) {
    const file = files.find(item =>
      item.name === '中国移动云盘产品手册.pdf' || item.name === '欢迎使用彩云.pdf' || item.name.startsWith('asign-')
    )
      || files[randomNumber(0, files.length - 1)]

    if (!file) {
      return { id: undefined }
    }

    return {
      id: file.id,
      name: file.name,
    }
  }
  return {
    id: $.config.tasks.shareFile || $.store.files?.[0],
  }
}

async function delShareFile($: M, linkIDs: string[]) {
  try {
    const { code, message, data } = await $.api.delOutLink($.config.phone, linkIDs)
    if (code === '0') {
      $.logger.debug(`删除分享成功`, linkIDs, message)
      return true
    }
    $.logger.debug(`分享文件失败`, code, message, data.result)
  } catch (error) {
    $.logger.debug(`删除分享文件失败`, error)
  }
}

async function shareTime($: M) {
  try {
    const { id, name } = await getShareFile($)
    if (!id) {
      $.logger.debug(`本次没有上传任务，跳过分享任务`)
      return
    }
    $.logger.debug('分享', id, name || '')
    const { code, message, data } = await $.api.getOutLink(
      $.config.phone,
      [id],
      '',
    )
    if (code === '0') {
      $.logger.success(`分享文件成功（分享成功不等于任务完成）`, message)
      try {
        await delShareFile($, [data.getOutLinkRes.getOutLinkResSet[0].linkID])
      } catch {}
      return true
    }
    $.logger.fail(`分享文件失败`, code, message, data && data.result)
  } catch (error) {
    $.logger.error(`分享文件异常`, error)
  }
}

// async function shareTime($: M) {
//   try {
//     const shareFile = await getShareFile($)
//     if (!shareFile) {
//       $.logger.debug(`本次没有上传任务，跳过分享任务`)
//       return
//     }
//     $.logger.debug('分享', shareFile)
//     const xml = await getIOutLink(
//       $.http,
//       $.config.phone,
//       shareFile,
//     )
//     if (xml.includes('getOutLinkRes') && xml.includes('linkID')) {
//       $.logger.success(`分享文件成功（分享成功不等于任务完成）`)
//       try {
//         await delShareFile($, [getXmlElement(xml, 'linkID')])
//       } catch {}
//       return true
//     }
//     $.logger.fail(`分享文件失败`, xml)
//   } catch (error) {
//     $.logger.error(`分享文件异常`, error)
//   }
// }

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
