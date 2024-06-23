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

export function createSignInApi(http: Http) {
  const caiyunUrl = 'https://caiyun.feixin.10086.cn/market/signin/'

  return {
    getTaskExpansion() {
      return http.get<TaskExpansion>(`${caiyunUrl}page/taskExpansion`)
    },
    receiveTaskExpansion(acceptDate: string) {
      return http.get<ReceiveTaskExpansion>(
        `${caiyunUrl}page/receiveTaskExpansion?acceptDate=${acceptDate}`,
      )
    },
    exchange(prizeId: string | number) {
      return http.get<ExchangeResult>(
        `${caiyunUrl}page/exchange?prizeId=${prizeId}&client=app&clientVersion=11.0.1&smsCode=`,
      )
    },
    receivePrizeDetails(prizeId: string | number) {
      return http.get<ReceivePrize>(
        `${caiyunUrl}page/receivePrizeDetails?prizeId=${prizeId}&marketId=sign_in_3_ex`,
      )
    },
    exchangeList() {
      return http.get<ExchangeList>(`${caiyunUrl}page/exchangeList`)
    },
  }
}
