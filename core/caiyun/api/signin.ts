import type { Http } from '@asign/types'
import type { BaseType } from '../types.js'
import type { ExchangeList, ExchangeResult, ReceivePrize } from '../types/exchange.js'

type ReceiveTaskExpansion = BaseType<{
  cloudCount: number
}>

type TaskExpansion = BaseType<{
  curMonthBackup: boolean
  preMonthBackup: boolean
  curMonthTaskRecordCount: number
  curMonthBackupTaskAccept: boolean
  nextMonthTaskRecordCount: number
  acceptDate: string
}>

export function createMarketApi(http: Http) {
  const caiyunUrl = 'https://mrp.mcloud.139.com/market/'
  const signInUrl = caiyunUrl + 'signin/'

  return {
    getTaskExpansion() {
      return http.get<TaskExpansion>(`${signInUrl}page/taskExpansion`)
    },
    receiveTaskExpansion(acceptDate: string) {
      return http.get<ReceiveTaskExpansion>(
        `${signInUrl}page/receiveTaskExpansion?acceptDate=${acceptDate}`,
      )
    },
    exchange(prizeId: string | number, smsCode = '') {
      return http.get<ExchangeResult>(
        `${signInUrl}page/exchange?prizeId=${prizeId}&client=app&clientVersion=11.3.2&smsCode=${smsCode}`,
      )
    },
    receivePrizeDetails(prizeId: string | number) {
      return http.get<ReceivePrize>(
        `${signInUrl}page/receivePrizeDetails?prizeId=${prizeId}&marketId=sign_in_3_ex`,
      )
    },
    exchangeList() {
      return http.get<ExchangeList>(`${signInUrl}page/exchangeList`)
    },
    getVerCode(prizeId: string | number) {
      return http.post<BaseType>(`${caiyunUrl}api/smsVerCode/getVerCode`, {
        prizeId,
        marketName: 'sign_in_3_ex',
        templateId: '800',
      })
    },
  }
}
