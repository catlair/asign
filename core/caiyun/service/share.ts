import { randomHex } from '@asign/utils-pure'
import { DB_KEYS } from '../constant'
import type { LocalStorage, M } from '../types'
import { request } from '../utils'
import { setDataNum } from '../utils/store'
import { receive } from './sign'
async function shareFind($: M) {
  const phone = $.config.phone
  try {
    const data = {
      traceId: Number(Math.random().toString().substring(10)),
      tackTime: Date.now(),
      distinctId: randomHex([14, 15, 8, 7, 15]),
      eventName: 'discoverNewVersion.Page.Share.QQ',
      event: '$manual',
      flushTime: Date.now(),
      model: '',
      osVersion: '',
      appVersion: '',
      manufacture: '',
      screenHeight: 895,
      os: 'Android',
      screenWidth: 393,
      lib: 'js',
      libVersion: '1.17.2',
      networkType: '',
      resumeFromBackground: '',
      screenName: '',
      title: '【精选】一站式资源宝库',
      eventDuration: '',
      elementPosition: '',
      elementId: '',
      elementContent: '',
      elementType: '',
      downloadChannel: '',
      crashedReason: '',
      phoneNumber: phone,
      storageTime: '',
      channel: '',
      activityName: '',
      platform: 'h5',
      sdkVersion: '1.0.1',
      elementSelector: '',
      referrer: '',
      scene: '',
      latestScene: '',
      source: 'content-open',
      urlPath: '',
      IP: '',
      url: `https://h.139.com/content/discoverNewVersion?columnId=20&token=STuid00000${Date.now()}${
        randomHex(
          20,
        )
      }&targetSourceId=001005`,
      elementName: '',
      browser: 'Chrome WebView',
      elementTargetUrl: '',
      referrerHost: '',
      browerVersion: '122.0.6261.106',
      latitude: '',
      pageDuration: '',
      longtitude: '',
      urlQuery: '',
      shareDepth: '',
      arriveTimeStamp: '',
      spare: { mobile: phone, channel: '' },
      public: '',
      province: '',
      city: '',
      carrier: '',
    }
    await $.api.datacenter(Buffer.from(JSON.stringify(data)).toString('base64'))
  } catch (error) {
    $.logger.error('分享有奖异常', error)
  }
}

export function getCloudRecord($: M) {
  return request($, $.api.getCloudRecord, '获取云朵记录')
}

/**
 * 返回需要次数
 */
async function getShareFindCount($: M) {
  const store = $.localStorage
    ? await $.localStorage.getItem<LocalStorage['shareFind']>(DB_KEYS.SHARE_FIND)
    : undefined
  if (!store) {
    const num = await getCloudRecordByFx($)
    await setDataNum($, DB_KEYS.SHARE_FIND, num)
    return 20 - num
  }
  const { lastUpdate, count } = store
  const isCurrentMonth = new Date().getMonth() === new Date(lastUpdate).getMonth()
  return isCurrentMonth ? 20 - count : 20
}

export async function shareFindTask($: M) {
  $.logger.start('------【邀请好友看电影】------')
  $.logger.info('测试中。。。')
  let count = await getShareFindCount($)
  if (count <= 0) {
    $.logger.info('本月已分享')
    return
  }

  if (!shareFirst($)) {
    $.logger.fail('尝试首次分享失败，跳过')
    return
  }

  ;--count
  let num: number

  while (count > 0) {
    count--
    $.logger.debug('邀请好友')
    await shareFind($)
    await $.sleep(2000)
  }
  await receive($)
  await setDataNum($, DB_KEYS.SHARE_FIND, num = await getCloudRecordByFx($))
  $.logger.info('已经完成次数', num)

  if (num !== 20 - count) {
    $.logger.debug('分享数据存在差异，请检查', num, 20 - count)
  }
}

async function shareFirst($: M) {
  await shareFind($)
  await $.sleep(1000)
  await receive($)
  await $.sleep(1000)
  const { records } = await getCloudRecord($)
  const recordFirst = records?.find((record) => record.mark === 'fxnrplus5')
  return recordFirst && new Date().getTime() - new Date(recordFirst.updatetime).getTime() < 20_000 // 减少一次
}

/**
 * 获取本月已经获得云朵数量
 */
async function getCloudRecordByFx($: M) {
  const records = await request($, $.api.getCloudRecord, '获取云朵记录', 1, 300)
  if (!records) return 0
  return records.records.filter(el =>
    el.mark === ('fxnrplus5') && new Date(el.inserttime).getUTCMonth() === new Date().getUTCMonth()
  ).length
}
