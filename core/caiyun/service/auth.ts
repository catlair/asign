import { getXmlElement } from '@asign/utils-pure'
import type { M } from '../types'

export async function refreshToken($: M) {
  try {
    const { token, phone } = $.config
    const tokenXml = await $.api.authTokenRefresh(token, phone)
    if (!tokenXml) {
      return $.logger.error(`authTokenRefresh 失败`)
    }
    return getXmlElement(tokenXml, 'token')
  } catch (error) {
    $.logger.error(`刷新 token 失败`, error)
  }
}
