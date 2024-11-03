import type { Http } from '@asign/types'
import { caiyunUrl, cloudPhoneMarketUrl } from '../constant/index.js'
import type { CloudPhone, ConfigTaskList, UserAccountInfo } from '../types/cloud-phone.js'

type TyrzToken = {
  desc: string
  resultCode: string
  retCode: string
  token: string
}

type TokenValidate = {
  header: {
    appId: string
    requestId: string
    status: string
    errMsg: string
  }
  data: {
    account: string
    token: string
    expireTime: 3600
    phone: string
  }
}

type Headers = {
  sign: string
  requestId: string
  appId: string
  token: string
  timestamp: string
}

export function userToastInfo(http: Http, headers: Headers) {
  return http.post(`${cloudPhoneMarketUrl}/redpacket/userToastInfo`, {}, { headers })
}

export function userAccountInfo(http: Http, headers: Headers) {
  return http.post<CloudPhone<UserAccountInfo>>(`${cloudPhoneMarketUrl}/redpacket/userAccountInfo`, {}, { headers })
}

export function configTaskList(http: Http, headers: Headers) {
  return http.post<CloudPhone<ConfigTaskList>>(`${cloudPhoneMarketUrl}/redpacket/configTaskList`, {}, { headers })
}

export function userSign(http: Http, headers: Headers) {
  return http.post<CloudPhone<{ status: number }>>(`${cloudPhoneMarketUrl}/redpacket/userSign`, {}, { headers })
}

export function getTyrzToken(http: Http) {
  return http.get<TyrzToken>(
    `${caiyunUrl}/portal/auth/getTyrzToken.action?sourceId=001216&_=${Date.now()}`,
  )
}

export function tokenValidate(http: Http, token: string, headers: Headers) {
  return http.post<TokenValidate>(
    `${cloudPhoneMarketUrl}/user/tokenValidate`,
    { version: '1.0', pintype: 13, token },
    {
      headers,
    },
  )
}
