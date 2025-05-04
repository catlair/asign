import type { LoggerType } from '@asign/types'
import dayjs from 'dayjs'
import { delay } from 'es-toolkit'
import { Buffer } from 'node:buffer'
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export { compare } from 'compare-versions'
export { set as setIn } from 'es-toolkit/compat'

export type { ConsolaInstance } from 'consola'

type BinaryLike = string | NodeJS.ArrayBufferView

export function sleep(time: number) {
  return new Promise<number>((res) => setTimeout(() => res(time), time))
}

export interface LoggerPushData {
  /**
   * 0 fatal and error
   *
   * 1 warn
   *
   * 2 normal
   *
   * 3 info success fail ready start
   *
   * 4 debug
   *
   * 5 trace
   *
   * 999 verbose
   *
   * -999 silent
   */
  level: 0 | 1 | 2 | 3 | 4 | 5 | -999 | 999 | number
  type: string
  msg: string
  date: Date
}

export async function createLogger(options?: { pushData: LoggerPushData[] }): Promise<LoggerType> {
  const { createConsola, consola } = await import('consola')
  consola.options.level = 5
  return createConsola({
    level: 5,
    reporters: [
      {
        log: ({ type, args, level, date }) => {
          if (options && options.pushData) {
            const msg = args
              .reduce<string>((str, cur) => `${str} ${cur}`, '')
              .substring(1)
            options.pushData.push({ msg, type, level, date })
          }
          consola[type].apply(consola, args)
        },
      },
    ],
  })
}

export function _hash(algorithm: string, input: BinaryLike) {
  const hash = createHash(algorithm).update(input)
  return hash.digest('hex')
}

export function sha256(input: BinaryLike) {
  return _hash('sha256', input)
}

export function md5(input: BinaryLike) {
  return _hash('md5', input)
}

/**
 * 读取 JSON 文件
 */
export function readJsonFile(path: string) {
  if (!fs.existsSync(path)) {
    throw new Error(`文件 ${path} 不存在`)
  }
  return new Function(`return ${fs.readFileSync(path, 'utf-8')}`)()
}

/**
 * @description 传入 demo.json 自动增加 demo.json5
 */
export function getConfig(name: string) {
  const resolveCwd = (str: string) => path.resolve(process.cwd(), str)
  const resolveDir = (str: string) => path.resolve(dirname(fileURLToPath(import.meta.url)), str)
  const configPath = Array.from(
    new Set<string>([
      resolveCwd(name + '5'),
      resolveDir(name + '5'),
      resolveCwd(name),
      resolveDir(name),
    ]),
  ).find((path) => fs.existsSync(path))
  return configPath ? readJsonFile(configPath) : undefined
}

export async function pushMessage({
  pushData,
  message,
  sendNotify,
  createRequest,
}: {
  pushData: LoggerPushData[]
  message: Record<string, any>
  sendNotify: any
  createRequest: any
}) {
  if (pushData.length && message) {
    if (message.onlyError && !pushData.some((el) => el.type === 'error')) {
      return
    }

    const msg = pushData
      .filter((el) => el.level < 4)
      .map((m) => `[${m.type} ${m.date.toLocaleTimeString()}]${m.msg}`)
      .join('\n')

    if (msg) {
      await sendNotify(
        {
          logger: await createLogger(),
          http: { fetch: (op: any) => createRequest().request(op) },
        },
        message,
        message.title || 'asign 运行推送',
        msg,
      )
    }
  }
}

function getAlgorithm(keyHex: string) {
  switch (Buffer.from(keyHex, 'hex').length) {
    case 16:
      return 'aes-128-cbc'
    case 24:
      return 'aes-192-cbc'
    case 32:
      return 'aes-256-cbc'
    default:
      throw new Error('Invalid key length !!!')
  }
}

function _aesDecrypt(text: string, key: string, iv: string) {
  const decipher = createDecipheriv(getAlgorithm(key), Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
  return decipher.update(text, 'hex', 'utf-8') + decipher.final('utf-8')
}

function _aesEncrypt(text: string, key: string, iv: string) {
  const cipher = createCipheriv(getAlgorithm(key), Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
  return cipher.update(text, 'utf-8', 'hex') + cipher.final('hex')
}

/**
 * 将 caiyun 的响应体解密
 *
 * @param text base64 密文
 */
export function decryptCaiyun(text: string) {
  const hexText = Buffer.from(text, 'base64').toString('hex')
  return _aesDecrypt(hexText.slice(32), '73634235495062495331515373756c734e7253306c673d3d', hexText.slice(0, 32))
}

/**
 * 将 caiyun 的响应体加密
 * @param text utf-8 原文
 *
 * @returns base64
 */
export function encryptCaiyun(text: string) {
  const iv = randomBytes(16).toString('hex')
  return Buffer.from(iv + _aesEncrypt(text, '73634235495062495331515373756c734e7253306c673d3d', iv), 'hex').toString(
    'base64',
  )
}

export function formatTime(date: Date | number | string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export async function waitToNextHour(millisecond = 400) {
  const time = dayjs().set('hour', dayjs().get('hour') + 1).set('minute', 0).set('second', 0).set(
    'millisecond',
    millisecond,
  ).toDate().getTime()

  delay(time - Date.now())
}

// 生成签名
export function generateSignature(
  id: string,
  timestamp: string | number,
  nonce: string,
  saltKey: number,
  other = '',
) {
  const salt = saltKey === 1 ? 'seed' + 'MdYY' + 'LIZfbCxg' : 'seka' + 'MdYYLI' + 'ZfbCfm'
  return md5(salt + id + timestamp + nonce + other + salt)
}

export function getSignHeader(timestamp?: number | string, saltKey = 1, other?: string) {
  const id = randomUUID()
  const nonce = randomUUID()
  return {
    'x-request-id': id,
    'x-timestamp': timestamp.toString(),
    'x-nonce': nonce,
    'x-signature': generateSignature(id, timestamp, nonce, saltKey, other),
  }
}
