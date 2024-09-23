import type { M } from '../types'
import { request } from '../utils/index.js'

async function signInApi($: M) {
  return await request($, $.api.signInInfo, '网盘签到')
}

async function signInWxApi($: M) {
  return await request($, $.api.signInfoInWx, '微信签到')
}

/**
 * 签到翻倍
 */
async function signInMulti($: M) {
  const { cloudCount, multiple } = await request($, $.api.singInMultiple, '备份签到翻倍')
  if (multiple) {
    $.logger.success('成功获得', multiple, '倍云朵，共计', cloudCount)
  }
}

export async function signIn($: M) {
  const { todaySignIn, total, toReceive, curMonthBackup, curMonthBackupSignAccept } = await signInApi($)
  $.logger.info(`当前云朵${total}${toReceive ? `，待领取${toReceive}` : ''}`)
  $.store.totalCloud = total
  if (curMonthBackup && !curMonthBackupSignAccept) {
    await signInMulti($)
  }
  if (todaySignIn === true) {
    $.logger.info(`网盘今日已签到`)
    return
  }
  await $.sleep(1000)
  const info = await signInApi($)
  if (!info) return
  if (info.todaySignIn === false) {
    $.logger.info(`网盘签到失败`)
    return
  }
  $.logger.info(`网盘签到成功`)
}

export async function signInWx($: M) {
  const info = await signInWxApi($)
  if (!info) return
  if (info.todaySignIn === false) {
    $.logger.fail(`微信签到失败`)
    if (info.isFollow === false) {
      $.logger.fail(`当前账号没有绑定微信公众号【中国移动云盘】`)
      return
    }
  }
  $.logger.info(`微信签到成功`)
}

export async function wxDraw($: M) {
  try {
    const drawInfo = await $.api.getDrawInWx()
    if (drawInfo.code !== 0) {
      $.logger.error(
        `获取微信抽奖信息失败，跳过运行，${JSON.stringify(drawInfo)}`,
      )
      return
    }

    if (drawInfo.result.surplusNumber < 50) {
      $.logger.info(
        `剩余微信抽奖次数${drawInfo.result.surplusNumber}，跳过执行`,
      )
      return
    }
    const draw = await $.api.drawInWx()
    if (draw.code !== 0) {
      $.logger.error(`微信抽奖失败，${JSON.stringify(draw)}`)
      return
    }
    $.logger.info(`微信抽奖成功，获得【${draw.result.prizeName}】`)
  } catch (error) {
    $
    $.logger.error(`微信抽奖异常`, error)
  }
}

export async function receive($: M) {
  return await request($, $.api.receive, '领取云朵')
}
