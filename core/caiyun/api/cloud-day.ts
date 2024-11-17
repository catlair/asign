import type { Http } from '@asign/types'
import { caiyunUrl } from '../constant/index.js'
import type { BaseType } from '../types.js'

export interface ProvPrizeList {
  prizeId: number

  prizeName: string

  imageUrl: string

  totalCount: number

  hasStock: boolean

  receiveFlag: boolean

  prizeType?: any

  provFlag: boolean

  prov: string

  limit: number

  maskLayer?: any
}

export interface NationalPrizeList {
  prizeId: number

  prizeName: string

  imageUrl: string

  totalCount: number

  hasStock: boolean

  receiveFlag: boolean

  prizeType: number

  provFlag: boolean

  prov: string

  limit: number

  maskLayer?: any
}

export function getCloudDayList(http: Http) {
  return http.get<BaseType<{ nationalPrizeList: NationalPrizeList[]; provPrizeList: ProvPrizeList[] }>>(
    caiyunUrl + '/ycloud/mcloudday/gift/list',
  )
}

// { code: 10001, msg: '抱歉，您不是会员用户，请开通会员后再试~' }
// { code: 10009, msg: '抱歉，宠爱礼奖品每月只能领取一次哦!' }
export function verifyCloudDay(http: Http, prizeId: number | string) {
  return http.post<BaseType>(
    caiyunUrl + '/ycloud/mcloudday/gift/verify',
    {
      prizeId,
    },
  )
}

// { code: 0, msg: 'success' }
export function getSmsVerCode(http: Http, prizeId: number | string) {
  return http.post<BaseType>(
    caiyunUrl + '/ycloud/api/smsVerCode/getVerCode',
    {
      prizeId,
      marketName: 'National_MCloudDay',
      templateId: '2084',
    },
  )
}

// { code: 10004, msg: '验证码校验失败！' }
// { code: 10001, msg: '抱歉，您不是会员用户，请开通会员后再试~'
// { code: 10005, msg: '抱歉，活动未开启，无法领取奖品！'
export function receiveCloudDayGift(http: Http, prizeId: number | string, smsCode: string) {
  return http.post<BaseType>(
    caiyunUrl + '/ycloud/mcloudday/gift/receive',
    {
      prizeId,
      smsCode,
    },
  )
}
