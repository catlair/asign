import type { LoggerType } from '@asign/types'
import crypto, { createCipheriv, createDecipheriv } from 'crypto'
import dayjs from 'dayjs'
import { delay } from 'es-toolkit/compat'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

export { compare } from 'compare-versions'
export { set as setIn } from 'es-toolkit/compat'

export type { ConsolaInstance } from 'consola'

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

export function _hash(algorithm: string, input: crypto.BinaryLike) {
  const hash = crypto.createHash(algorithm).update(input)
  return hash.digest('hex')
}

export function sha256(input: crypto.BinaryLike) {
  return _hash('sha256', input)
}

export function md5(input: crypto.BinaryLike) {
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
  return _aesDecrypt(hexText.slice(32), '6a43434865714e53624932787262354f', hexText.slice(0, 32))
}

/**
 * 将 caiyun 的响应体加密
 * @param text utf-8 原文
 *
 * @returns base64
 */
export function encryptCaiyun(text: string) {
  const iv = crypto.randomBytes(16).toString('hex')
  return Buffer.from(iv + _aesEncrypt(text, '6a43434865714e53624932787262354f', iv), 'hex').toString('base64')
}

export function formatTime(date: Date | number | string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export async function waitToNextHour(millisecond = 400) {
  const time = dayjs().set('hour', dayjs().get('hour') + 1).set('minute', 0).set('second', 0).set(
    'millisecond',
    millisecond,
  ).toDate().getTime()

  await delay(time - Date.now())
}
