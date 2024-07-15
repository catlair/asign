import { createApi, type M, run } from '@asign/quark-core'
import { createLogger } from '@asign/utils-pure'
import { createSimpleRequest, getPushConfig, sendWpsNotify } from '@asign/wps-utils'

type Config = {
  kps: string
  sign: string
  vcode: string
}

function main(query: Config, option?: { pushData: any }) {
  if (!query.kps || !query.sign) return
  const logger = createLogger({ pushData: option && option.pushData })

  const $: M = {
    api: createApi(createSimpleRequest({
      'content-type': 'application/json',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
    })),
    logger: logger as any,
    sleep: Time.sleep,
    query,
  }

  $.logger.start(`--------------`)

  run($)
}

// 获取当前工作表的使用范围
const sheet = Application.Sheets.Item('夸克网盘') || Application.Sheets.Item('quark') || ActiveSheet

if (!sheet) {
  console.error('请确定单元格名为 夸克网盘 或 quark 或者已经聚焦到对应单元格')
}

const usedRange = sheet.UsedRange
const columnA = sheet.Columns('A')
const columnB = sheet.Columns('B')
const columnC = sheet.Columns('C')
const len = usedRange.Row + usedRange.Rows.Count - 1
const pushData = []

for (let i = 1; i <= len; i++) {
  const cell = columnA.Rows(i)
  if (cell.Text) {
    console.log(`执行第 ${i} 行`)
    main({
      sign: columnB.Rows(i).Text,
      kps: cell.Text,
      vcode: columnC.Rows(i).Text,
    }, { pushData })
  }
}

sendWpsNotify(pushData, getPushConfig())
