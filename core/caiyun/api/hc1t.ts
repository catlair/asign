import type { Http } from '@asign/types'
import type { BaseType } from '../types'
import type { Hecheng1T } from '../types/hc1t'

type ExchangeHecheng1T = BaseType<{
  id: string
  phone: string
  inner: number
  stage: number
  curr: number
  exchange: number
  invite: number
  inviteds: null[]
  succ: number
  lastUpdate: string
  lastSucc: string
  flag: boolean
}>

export function createHc1tApi(http: Http) {
  const caiyunUrl = 'https://caiyun.feixin.10086.cn'

  return {
    beinviteHecheng1T(inviter?: string) {
      return http.get(
        `${caiyunUrl}/market/signin/hecheng1T/beinvite`
          + (inviter ? `?inviter=${inviter}` : ''),
      )
    },
    finishHecheng1T() {
      return http.get(`${caiyunUrl}/market/signin/hecheng1T/finish?flag=true`)
    },
    getHecheng1T() {
      return http.get<Hecheng1T>(`${caiyunUrl}/market/signin/hecheng1T/info`)
    },
    exchangeHecheng1T(num: number) {
      return http.get<ExchangeHecheng1T>(
        `${caiyunUrl}/market/signin/hecheng1T/exchange?num=${num}`,
      )
    },
  }
}
