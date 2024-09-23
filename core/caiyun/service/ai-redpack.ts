import { isWps, randomNumber } from '@asign/utils-pure'
import { caiyunUrl, mw2TogetherUrl } from '../constant/index.js'
import type { M } from '../types.js'
import { request } from '../utils/index.js'
import { loginEmail, setUserId } from './auth.js'

export async function aiRedPackTask($: M) {
  $.logger.start(`------【AI红包】------`)
  if (isWps()) {
    $.logger.fail('AI红包', '当前环境为WPS，跳过')
    return
  }

  try {
    await blindboxJournaling($)

    const sid = await init($)
    if (!sid) return

    await setUserId($)

    let count = 4

    while (!(await _task($)) && count > 0) {
      count--
    }
  } catch (error) {
    $.logger.error('AI红包', error)
  }
}

async function blindboxJournaling({ api, sleep }: M) {
  const marketName = '&marketName=National_LanternRiddlesal_LanternRiddles'
  await api.journaling('National_LanternRiddles_client_all', 1008, marketName)
  await sleep(200)
  await api.journaling('National_LanternRiddles_pv', 1008, marketName)
  await sleep(200)
  await api.journaling('National_LanternRiddles_client_isApp', 1008, marketName)
  await sleep(200)
}

function saveSession($: M, { sessionId, dialogueId }) {
  $.store.aiSession || ($.store.aiSession = [])
  $.store.aiSession.push({ sessionId, dialogueId })
  $.logger.debug('保存会话', sessionId, dialogueId)
}

async function _task($: M) {
  const sleep = $.sleep

  await sleep(1000)

  const puzzleCards = await getPuzzleCards($)
  if (!puzzleCards) return

  const puzzleCard = puzzleCards[randomNumber(0, puzzleCards.length - 1)]
  $.logger.debug('谜面 -> ', puzzleCard.puzzle)

  await sleep(200)

  const { msg, exitMsg, needMatch, failMsg } = await getMailChatMsg($, puzzleCard.puzzle)
  if (exitMsg) throw new Error(exitMsg)
  if (failMsg) return $.logger.fail('AI红包', failMsg)
  if (!msg) return $.logger.debug('获取AI聊天消息失败')

  const tip = needMatch ? matchResult(msg) : msg
  if (!tip) return $.logger.fail('AI红包', '未获取到谜底', msg)

  $.logger.debug('谜底 -> ', tip)

  await sleep(400)

  const answered = await submitAnswered($, puzzleCard.id, tip)
  if (answered === -1) return true
  if (answered !== 0) return

  await sleep(400)

  const prizeName = await openRedPack($, puzzleCard.id)
  if (prizeName === -1) return true
  if (typeof prizeName === 'number') return

  if (prizeName !== '谢谢参与') {
    $.logger.success('获得', prizeName)
    return true
  }

  $.logger.debug('获得', prizeName)
}

async function init($: M) {
  try {
    const loginInfo = await loginEmail($)
    if (!loginInfo) {
      return
    }
    const { sid, rmkey } = loginInfo
    if (sid) {
      $.http.setCookie('sid', sid, caiyunUrl)
      $.http.setCookie('RMKEY', rmkey, mw2TogetherUrl)
      return sid
    }
  } catch (error) {
    $.logger.error('邮箱登录异常', error)
  }
}

async function getPuzzleCards($: M) {
  const puzzleCards = await request($, $.api.getIndexPuzzleCard, { name: '获取谜底列表' })
  if (!puzzleCards.length) {
    $.logger.fail('未获取到谜底列表，跳过任务')
    return
  }
  return puzzleCards
    .filter(({ puzzleTitleContext }) => puzzleTitleContext && puzzleTitleContext.length < 6)
    .map(item => ({
      puzzle: item.puzzleTitleContext,
      id: item.id,
    }))
}

async function getMailChatMsg($: M, dialogue: string) {
  try {
    const { code, success, message, data } = await $.api.addChat(dialogue, $.config.userId)
    if (!success) {
      $.logger.fail('获取AI聊天消息失败', code, message)
      if (code === '10000007' || code === '01000004') {
        return { exitMsg: message }
      }
      return {}
    }

    if (data.sessionId) {
      saveSession($, data)
    }

    if (data.flowResult) {
      return {
        msg: data.flowResult.outContent,
        needMatch: true,
      }
    }

    if (data.leadCopy) {
      return {
        msg: data.leadCopy.linkName,
      }
    }

    return { failMsg: JSON.stringify({ code, message, success, data }) }
  } catch (error) {
    $.logger.error('获取AI聊天消息异常', error)
  }
}

function matchResult(result: string) {
  if (!result.includes('<p>') || !result.includes('——')) {
    return
  }
  const [, r1] = result.split('<p>')
  const [r2] = r1.split(/<\/p\s?>/)
  if (!r2) return
  const [, r3] = r2.trim().split(/—+/)
  const r4 = r3 && r3.trim().replace(/<br\s?\/>/, '')
  return r4 && r4.split('/')[0]
}

/**
 * 回答答案
 */
async function submitAnswered($: M, id: string, a: string) {
  try {
    const { code, msg } = await $.api.submitAnswered(id, a)

    switch (code) {
      case 0:
        $.logger.debug('回答问题成功')
        return 0
      case 201:
        $.logger.fail('回答问题成功，但', msg)
        return -1
      default:
        $.logger.fail('回答问题失败', code, msg)
        return 1
    }
  } catch (error) {
    $.logger.error('回答答案异常', error)
  }
  return 2
}

async function openRedPack($: M, puzzleId: string) {
  try {
    const { code, msg, result } = await $.api.getAwarding(puzzleId)

    switch (code) {
      case 0:
        return result.prizeName
      case 10010020:
        $.logger.fail('可能你需要去 APP 手动完成一次', code, msg)
        return -1
      default:
        $.logger.fail('打开红包失败', code, msg)
        return 1
    }
  } catch (error) {
    $.logger.error('打开红包', error)
  }
  return 2
}
