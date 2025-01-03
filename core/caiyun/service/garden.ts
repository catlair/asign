import { asyncForEach } from '@asign/utils-pure'
import type { ClientTypeHeaders } from '../api.js'
import type { M } from '../types.js'
import type { TaskList } from '../types/garden.js'
import { getSsoTokenApi } from './auth.js'
import { uploadRandomFile } from './index.js'

async function request<T extends (...args: any[]) => any>(
  $: M,
  api: T,
  options: {
    name: string
    defu: Awaited<ReturnType<T>>['result']
  },
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['result']>
async function request<T extends (...args: any[]) => any>(
  $: M,
  api: T,
  name: string,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['result']>
async function request<T extends (...args: any[]) => any>(
  $: M,
  api: T,
  options: string | {
    name: string
    defu: Awaited<ReturnType<T>>['result']
  },
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['result']> {
  let name: string
  let defu: Awaited<ReturnType<T>>['result']
  if (typeof options === 'string') {
    name = options
    defu = {}
  } else {
    name = options.name
    defu = options.defu
  }
  try {
    const { success, msg, result } = await api(...args)
    if (!success) {
      $.logger.error(`${name}失败`, msg)
      result && $.logger.debug(result)
    } else {
      return result
    }
  } catch (error) {
    $.logger.error(`${name}异常`, error)
  }
  return defu
}

async function getTodaySign($: M) {
  const { todayCheckin } = await request(
    $,
    $.gardenApi.checkinInfo,
    '获取果园签到信息',
  )
  return todayCheckin
}

async function initTree($: M): Promise<[boolean, { treeLevel: number; collectWater: number }]> {
  const { collectWater, treeLevel, nickName, uid } = await request(
    $,
    $.gardenApi.initTree,
    '初始化果园',
  )
  if (!nickName) return [true] as any
  $.logger.info(`${nickName}[${uid}]拥有${treeLevel}级果树，当前水滴${collectWater}`)
  return [false, { treeLevel, collectWater }]
}

async function signInGarden($: M) {
  const todaySign = await getTodaySign($)
  if (todaySign === undefined) return
  if (todaySign) return $.logger.info(`今日果园已签到`)
  try {
    const { code, msg } = await request($, $.gardenApi.checkin, '果园签到')
    if (code !== 1) {
      $.logger.error('果园签到失败', code, msg)
    }
  } catch (error) {
    $.logger.error(`果园签到异常`, error)
  }
}

async function clickCartoon($: M) {
  const cartoonTypes = await request($, $.gardenApi.getCartoons, { name: '获取已经完成的场景列表', defu: [] })

  await asyncForEach(
    (['cloud', 'color', 'widget', 'mail'] as const).filter(cart => !cartoonTypes.includes(cart)),
    async (cartoonType) => {
      const { msg, code } = await request(
        $,
        $.gardenApi.clickCartoon,
        '领取场景水滴',
        cartoonType,
      )
      if (![1, -1, -2].includes(code)) {
        $.logger.error(`领取场景水滴${cartoonType}失败`, code, msg)
        return
      }
      $.logger.debug(`领取场景水滴${cartoonType}`)
    },
    async () => await $.sleep(5000),
  )
}

async function getTaskList($: M, headers?: ClientTypeHeaders) {
  return await request(
    $,
    $.gardenApi.getTaskList,
    { name: '获取任务列表', defu: [] },
    headers,
  )
}

async function getTaskStateList($: M, headers?: ClientTypeHeaders) {
  return await request(
    $,
    $.gardenApi.getTaskStateList,
    { name: '获取任务完成情况表', defu: [] },
    headers,
  )
}

async function doTask(
  $: M,
  tasks: TaskList['result'],
  headers?: ClientTypeHeaders,
) {
  const taskMap = {
    '2002': async () => {
      if (
        await uploadRandomFile($, { channelSrc: '10000023' })
      ) {
        await $.sleep(6000)
        return true
      }
    },
    '2003': async () => {
      if (
        await uploadRandomFile($, { ext: '.mp4', channelSrc: '10000023' })
      ) {
        await $.sleep(6000)
        return true
      }
    },
  }

  await asyncForEach(
    tasks,
    async ({ taskId, taskName }) => {
      const { code, summary } = await request(
        $,
        $.gardenApi.doTask,
        `接收${taskName}任务`,
        taskId,
        headers,
      )
      switch (code) {
        case -1:
        case 1:
          $.logger.debug(`${taskName}任务已领取`)
          taskMap[taskId] && await taskMap[taskId]()
          return
        default:
          $.logger.error(`领取${taskName}失败`, code, summary)
          return
      }
    },
    async () => await $.sleep(6000),
  )
}

async function doTaskByHeaders($: M, headers: ClientTypeHeaders) {
  try {
    const taskList = await getTaskList($, headers)
    const _stateList = await getTaskStateList($, headers)
    const stateList = _stateList.reduce(
      (arr, { taskId, taskState }) => taskState === 0 ? [...arr, taskId] : arr,
      [] as number[],
    )
    if (_stateList.length && !stateList.length) return
    await $.sleep(2000)
    return await _run(stateList.length ? taskList.filter((task) => stateList.indexOf(task.taskId) !== -1) : taskList)

    async function _run(
      _taskList: TaskList['result'],
    ) {
      await $.sleep(5000)
      await doTask($, _taskList, headers)
      await $.sleep(4000)
      const stateList = (await getTaskStateList($, headers)).filter(({ taskState }) => taskState === 1).map((
        { taskId },
      ) => taskId)
      await $.sleep(200)
      await givenWater($, taskList.filter((task) => stateList.indexOf(task.taskId) !== -1), headers)
    }
  } catch (error) {
    $.logger.error('任务异常', error)
  }
}

type GivenWaterList = { taskId: number; taskName: string }

async function givenWater(
  $: M,
  tasks: GivenWaterList[],
  headers?: ClientTypeHeaders,
) {
  await asyncForEach(
    tasks,
    async ({ taskName, taskId }) => {
      const { water, msg } = await request(
        $,
        $.gardenApi.givenWater,
        `领取${taskName}水滴`,
        taskId,
        headers,
      )
      if (water === 0) $.logger.error(`领取${taskName}奖励失败`, msg)
      else $.logger.success(`领取${taskName}奖励`)
    },
    async () => await $.sleep(6000),
  )
}

/**
 * @returns
 *
 * 1 成功
 *
 * -3 没有次数
 */
async function _backupFriend($: M, inviteCode: string | number) {
  try {
    $.logger.debug(`助力：${inviteCode}`)
    const { success, msg, result } = await $.gardenApi.inviteFriend(inviteCode, 'backup')
    if (success) {
      if (result.code === 1) {
        $.logger.debug(result.msg)
        return result.code
      }

      $.logger.fail('助力失败', result.code, result.msg)
      return result.code // -3 次数用完
    }
    $.logger.fail('助力失败', msg)
  } catch (error) {
    $.logger.fail('果园助力异常', error)
  }
}

export async function setInviteCode($: M) {
  try {
    const data = await $.http.post('https://caiyun.as.thefish.icu/code', {
      inviteCode: await request($, $.gardenApi.getInviteCode, '获取邀请码'),
      id: $.md5($.config.phone),
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      throwHttpErrors: true,
    })
    if (!data.ok) {
      $.logger.debug('设置邀请码失败', data)
    }
  } catch (error) {
    $.logger.debug('设置邀请码异常', error)
  }
}

export async function getInviteCodes($: M): Promise<number[]> {
  try {
    return await $.http.get(`https://caiyun.as.thefish.icu/code?user=${$.md5($.config.phone)}`, {
      throwHttpErrors: true,
    })
  } catch (error) {
    $.logger.debug('获取邀请码异常', error)
  }
  return []
}

/**
 * 完成邀请
 */
async function completeInvite($: M, inviteCodes: number[]) {
  try {
    await $.http.post('https://caiyun.as.thefish.icu/invite', { inviteCodes, id: $.md5($.config.phone) }, {
      headers: {
        'Content-Type': 'application/json',
      },
      throwHttpErrors: true,
    })
  } catch (error) {
    $.logger.debug('完成邀请异常', error)
  }
}

/**
 * 果园助力
 */
async function backupFriend($: M) {
  try {
    for (const inviteCode of $.config.garden.inviteCodes) {
      await _backupFriend($, inviteCode)
      await $.sleep(5000)
    }
  } catch (error) {
    $.logger.error('果园助力异常', error)
  }
}

/**
 * 果园助力
 */
async function backupFriendNew($: M) {
  try {
    if ($.config.garden.开启果园助力) return
    await setInviteCode($)
    const inviteCodes = await getInviteCodes($)
    if (inviteCodes.length === 0) return
    const successArr: number[] = []
    for (let index = 0; index < inviteCodes.length; index++) {
      const inviteCode = inviteCodes[index]
      const result = await _backupFriend($, inviteCode)
      if (result === 1) successArr.push(inviteCode)
      else if (result === -3) break
      // 第二个，且不是最后一个多等待
      await $.sleep(index === 1 && index < inviteCodes.length - 1 ? 20000 : 6000)
    }
    await completeInvite($, successArr)
  } catch (error) {
    $.logger.error('果园助力异常', error)
  }
}

/**
 * 浇水
 */
async function watering($: M, level: number) {
  $.logger.debug(`给果树浇水`)
  try {
    const { water, upgrade, code, msg } = await request($, $.gardenApi.watering, '浇水')
    if (code !== 1) {
      $.logger.fail('浇水失败', code, msg || '[c:请求错误]')
      return
    }
    $.logger.success(`浇水成功，消耗${water}水滴，${upgrade ? '升级' : '未升级'}`)
    if (upgrade && level % 2 === 1) {
      await openBox($)
    }
  } catch (error) {
    $.logger.error('果园浇水异常', error)
  }
}

async function openBox($: M) {
  const { msg, code, water } = await request($, $.gardenApi.openBox, '开宝箱')
  if (code !== 1) {
    $.logger.fail('开宝箱失败', code, msg || '[c:请求错误]')
    return
  }
  $.logger.success('开宝箱成功，获得', water, '水滴')
}

async function _waterFriend($: M, uid: number) {
  try {
    const { msg, code } = await request($, $.gardenApi.waterFriend, '浇水', uid)
    if (code !== 1) {
      $.logger.fail('浇水失败', code, msg || '[c:请求错误]')
      return
    }
    $.logger.debug(uid, '浇水成功')
    return true
  } catch (error) {
    $.logger.error('果园给好友浇水异常', uid, error)
  }
}

async function waterFriend($: M) {
  const waterFriend = $.config.garden.waterFriend
  if (!waterFriend) return
  $.logger.debug(`给好友果树浇水`)
  for (let index = 0; index < 5; index++) {
    await _waterFriend($, waterFriend)
    await $.sleep(4000)
  }
}

export async function loginGarden($: M) {
  const token = await getSsoTokenApi($, $.config.phone)
  if (!token) throw new Error('获取 ssoToken 失败')
  await $.gardenApi.login(token, $.config.phone)
}

export async function gardenTask($: M) {
  try {
    $.logger.info(`------【果园】------`)
    await loginGarden($)

    const [initErr, tree] = await initTree($)

    if (initErr) {
      $.logger.warn('获取果园信息失败，请确认已经激活果园')
      return
    }

    await signInGarden($)

    await $.sleep(2000)
    $.logger.info('领取场景水滴')
    await clickCartoon($)

    $.logger.info('完成邮箱任务')
    await doTaskByHeaders($, {
      'user-agent': $.DATA.baseUA + $.DATA.mailUaEnd,
      'x-requested-with': $.DATA.mailRequested,
    })
    await $.sleep(2000)

    $.logger.info('完成云盘任务')
    await doTaskByHeaders($, {
      'user-agent': $.DATA.baseUA,
      'x-requested-with': $.DATA.mcloudRequested,
    })

    if ($.config.garden?.inviteCodes?.length) {
      $.logger.info('果园微信助力')
      await backupFriend($)
    } else {
      $.logger.info('果园微信助力（测试）')
      await backupFriendNew($)
    }

    // 先给好友浇水
    await waterFriend($)

    // 随机浇水，就是玩，嘿嘿
    if (tree.treeLevel < 9 && tree.collectWater && Math.random() < 0.2) {
      await watering($, tree.treeLevel)
    }
  } catch (error) {
    $.logger.error('果园任务异常', error)
  }
}
