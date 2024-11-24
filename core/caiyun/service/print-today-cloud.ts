import { M } from '../types'
import { request } from '../utils'

export async function getCloudRecord($: M) {
  return await request($, $.api.getCloudRecord, '获取云朵记录', 1, 100)
}

export async function printTodayCloud($: M) {
  if (!$.config.是否打印今日云朵) return
  $.logger.start(`------【今日云朵】------`)

  try {
    const res = await getCloudRecord($)
    if (!res) return $.logger.fail('获取云朵记录失败')
    const records = res.records.filter(record => {
      const date = new Date(record.inserttime)
      const today = new Date()
      return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && record.num > 0
    })
    const total = records.reduce((acc, cur) => acc + cur.num, 0)
    $.logger.info(`今日获得${records.length}次云朵数量共：${total}`)
  } catch (error) {
    $.logger.fatal('printTodayCloud 异常', error)
  }
}
