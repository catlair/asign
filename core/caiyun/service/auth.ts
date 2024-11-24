import { getXmlElement } from '@asign/utils-pure'
import { Buffer } from 'node:buffer'
import { DB_KEYS } from '../constant'
import type { M } from '../types'
import { request } from '../utils'

export async function _getSsoTokenApi($: M, phone: number | string) {
  try {
    const { success, data, code, message } = await $.api.querySpecToken(phone)
    if (!success) {
      $.logger.debug(`获取 ssoToken 失败`, code, message, data)
      return
    }
    return data.token
  } catch (error) {
    $.logger.error(`获取 ssoToken 异常`, error)
  }
}

export async function getSsoTokenApi($: M, phone: number | string) {
  let token: string
  for (let index = 0; index < 5; index++) {
    token = await _getSsoTokenApi($, phone)
    if (token) return token
    await $.sleep(2000)
  }
  $.logger.fatal('获取 ssoToken 失败，请查看 debug 信息')
}

export async function loginEmail($: M) {
  const ssoToken = await getSsoTokenApi($, $.config.phone)
  if (!ssoToken) return

  try {
    const { code, summary, var: data } = await $.api.loginMail(ssoToken)
    if (code !== 'S_OK') {
      $.logger.fatal('获取 sid 失败', code, summary)
      return
    }

    return data
  } catch (error) {
    $.logger.error(`获取 sid 异常`, error)
  }
  return
}

export async function refreshToken($: M) {
  try {
    const { token, phone } = $.config
    const tokenXml = await $.api.authTokenRefresh(token, phone)
    if (!tokenXml) {
      return $.logger.error(`authTokenRefresh 失败`)
    }
    const newToken = getXmlElement(tokenXml, 'token')
    if (newToken) return newToken
    $.logger.error(tokenXml)
  } catch (error) {
    $.logger.error(`刷新 token 失败`, error)
  }
}

async function getJwtTokenApi($: M, ssoToken: string) {
  return (await request($, $.api.tyrzLogin, '获取 ssoToken ', ssoToken)).token
}

export async function getJwtToken($: M) {
  const ssoToken = await getSsoTokenApi($, $.config.phone)
  if (!ssoToken) return

  return await getJwtTokenApi($, ssoToken)
}

export async function getNoteAuthToken($: M) {
  try {
    return $.api.getNoteAuthToken($.config.token, $.config.phone)
  } catch (error) {
    $.logger.error('获取云笔记 Auth Token 异常', error)
  }
}

export async function getUserId($: M) {
  const { body } = await getNoteAuthToken($)
  if (!body) return

  const match = body.match(/"userId":(\d+)/)
  if (match) {
    return match[1]
  }
}

export async function setUserId($: M) {
  let userId = await $.localStorage?.getItem<string | null>(DB_KEYS.USER_ID)
  if (userId) {
    $.config.userId = userId
    return
  }
  if ((userId = await getUserId($))) {
    $.config.userId = userId
    await $.localStorage?.setItem(DB_KEYS.USER_ID, userId)
  }
}

export function getTokenExpireTime(token: string) {
  return Number(token.split('|')[3])
}

/**
 * 获取是否需要刷新
 * @description 有效期 30 天，还有 5 天，需要刷新
 */
export function isNeedRefresh(expireTime: number, day: number) {
  return expireTime - Date.now() < day * 86400000
}

export async function createNewAuth($: M) {
  const { config, logger } = $
  logger.debug('------【检测账号有效期】------')
  logger.debug(`token 有效期 ${Math.floor((config.expire - Date.now()) / 86400000)} 天`)

  if (!isNeedRefresh(config.expire, config.剩余多少天刷新token)) return

  logger.info('尝试生成新的 auth')

  return await getNewAuth($)
}

export function formatAuth(token: string, phone: string, platform: string) {
  return Buffer.from(`${platform}:${phone}:${token}`).toString('base64')
}

export async function getNewAuth($: M) {
  const token = await refreshToken($)
  if (token) {
    const { config } = $
    return formatAuth(token, config.phone, config.platform)
  }
  $.logger.error('生成新 auth 失败')
}
