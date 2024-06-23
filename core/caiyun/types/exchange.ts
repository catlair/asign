import type { BaseType } from '../types'

export type ExchangeList = BaseType<{
  '0': _0[]
  '1': _1[]
  '2': _1[]
  '5': _1[]
  '7': _1[]
  '8': _1[]
}>

interface _0 extends _1 {
  ownEquityPrizeSubType?: number
  typeTimes?: number
}

interface _1 {
  probability2: string
  canEdit: number
  groupId: number
  memo: string
  oid: number
  allowInside: number
  totalCount: number
  type: number
  prizeId: number
  dailyRemainderCount: number
  dailyCount: number
  pOrder: number
  imageUrl: string
  /**
   * 0 可兑换？
   *
   * 2 已兑换
   *
   * 4 本月本组已兑换，下月再来
   */
  limit: 0 | 1 | 2 | 3 | 4
  startTime: string
  count: number
  updateTime: string
  sort: number
  onLine: number
  receiveQuantity: number
  areaCode: string
  marketName: string
  prizeName: string
  endTime: string
}

/**
 * code 2301 重复兑奖
 */
export type ExchangeResult = BaseType<{
  oid: number
  /** 手机 */
  servNumber: string
  /** id */
  prizeId: number
  prizeName: string
  flag: number
  insertTime: string
  linkUrl: string
  type: number
  /** 价格 */
  uorder: number
  /** id */
  reasons: string
  memo: string
  updateTime: string
  marketName: string
  sourceId: string
  orderType: number
  expireTime: string
  source: number
  device: number
}>

export type ReceivePrize = BaseType<{
  riskUserEnable: number
  memo: string
  prizename: string
  verifycode: number
  riskEnable: number
  expireDay: number
  prizetype: string
  id: number
  riskErrorNum: number
  /** 2031 是已经兑换 */
  exchangeCode: number
  limitReceiveNumber: number
  receiverPrizeBtnType: number
  limitUserReceiveType: number
  marketid: string
  limitUserReceiveNumber: number
  serial: number
  limitCurrentMonth: number
  limitReceiveType: number
}>
