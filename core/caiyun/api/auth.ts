import type { Http } from '@asign/types'
import { getSignHeader } from '@asunajs/utils'
import { caiyunUrl } from '../constant'

export function querySpecToken(http: Http, timestamp?: number, sourceId = '001005') {
  return http.get<{ /** 0 **/ code: number; /** success */ msg: string; result: string }>(
    `${caiyunUrl}/ycloud/api/cloud/userdomain/v2/querySpecToken?targetSourceId=${sourceId}`,
    {
      headers: getSignHeader(timestamp, 2),
    },
  )
}

export function tyrzLogin(http: Http, ssoToken: string, timestamp?: number) {
  return http.get<{ /** 0 **/ code: number; /** success */ msg: string; result: Record<string, string> }>(
    `${caiyunUrl}/portal/auth/v2/tyrzLogin.action?ssoToken=${ssoToken}&openAccount=0`,
    {
      headers: getSignHeader(timestamp, 2, `ssoToken=${ssoToken}&openAccount=0`),
    },
  )
}

export function encryptDataLogin(http: Http) {
  return http.get<{ /** 10000 **/ code: number; /** success */ msg: string; result: string }>(
    `${caiyunUrl}/portal/auth/encryptDataLogin.action?op=getAccount&invateCode=invateCode&channel=&marketName=hecheng1T&sourceId=1005`,
  )
}
