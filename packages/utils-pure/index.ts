import { Buffer } from 'node:buffer'

/**
 * @param length 长度
 * @param part 当长度为数组时，填充
 * @returns
 */
export function randomHex(length: number | number[], pad = '-'): string {
  if (Array.isArray(length)) {
    return length.map((l) => randomHex(l, pad)).join(pad)
  }
  return Array.from({
    length,
  })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')
}

export function randomNumber(low: number, high = low) {
  return Math.floor(Math.random() * (high - low) + low)
}

/**
 * 随机字符串 62 个
 */
export function randomString(length: number) {
  return Array.from({
    length,
  })
    .reduce((str) => {
      const num = Math.floor(Math.random() * 62)
      return str + String.fromCharCode(num + (num < 10 ? 48 : num < 36 ? 55 : 61))
    }, '')
}

export function getXmlElement(xml: string, tag: string) {
  if (!xml.match) return ''
  const m = xml.match(`<${tag}>(.*)</${tag}>`)
  return m ? m[1] : ''
}

export interface LoggerPushData {
  type: string
  msg: string
  date: Date
}

export function createLogger(options?: { pushData: LoggerPushData[] }) {
  const wrap = (type: string, ...args: any[]) => {
    if (options && options.pushData) {
      const msg = args
        .reduce<string>((str, cur) => `${str} ${cur}`, '')
        .substring(1)
      options.pushData.push({ msg, type, date: new Date() })
    }
    console[type](...args)
  }
  const info = (...args: any[]) => wrap('info', ...args),
    error = (...args: any[]) => wrap('error', ...args)
  return {
    info,
    error,
    fatal: error,
    debug: info,
    start: info,
    success: info,
    fail: info,
    trace: info,
    warn: (...args: any[]) => wrap('warn', ...args),
  }
}

export function getHostname(url: string) {
  return url.split('/')[2].split('?')[0]
}

export async function asyncForEach<I = any>(
  array: I[],
  task: (arg: I) => Promise<any>,
  cb?: () => Promise<any>,
) {
  const len = array.length
  for (let index = 0; index < len; index++) {
    const item = array[index]
    await task(item)
    if (index < len - 1) {
      cb && (await cb())
    }
  }
}

export function setStoreArray(
  store: Record<string, any>,
  key: string,
  values: any[],
) {
  if (Reflect.has(store, key)) {
    return Reflect.set(store, key, Reflect.get(store, key).concat(values))
  }
  return Reflect.set(store, key, values)
}

export function getAuthInfo(auth: string) {
  auth = auth.replace('Basic ', '')
  auth = padBase64(auth)

  const rawToken = Buffer.from(auth, 'base64').toString('utf-8')
  const [platform, phone, token] = rawToken.split(':')

  return {
    phone,
    token,
    auth: `Basic ${auth}`,
    platform,
    expire: Number(token.split('|')[3]),
  }
}

/**
 *  填充 base64
 * @description 如果 str.length % 4 !== 0，则在末尾补上 '='
 */
export function padBase64(str: string) {
  return str.length % 4 === 0 ? str : str + '='.repeat(4 - str.length % 4)
}

export function hashCode(str: string) {
  if (typeof str !== 'string') {
    return 0
  }
  let hash = 0
  let char = null
  if (str.length == 0) {
    return hash
  }
  for (let i = 0; i < str.length; i++) {
    char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash
}

export function isWps(): boolean {
  try {
    return globalThis.URLSearchParams === undefined && globalThis.HTTP
  } catch {
    return false
  }
}

export function createTime() {
  const now = new Date()
  return now.getUTCFullYear()
    + pad2(now.getUTCMonth() + 1)
    + pad2(now.getUTCDate())
    // +8 时区
    + pad2(now.getUTCHours() + 8)
    + pad2(now.getUTCMinutes())
    + pad2(now.getUTCSeconds())
}

export function pad2(num: number) {
  return num < 10 ? `0${num}` : `${num}`
}

export function toLowerCaseHeaders(headers?: Record<string, string | string[]>) {
  if (!headers) return {}
  return Object.entries(headers).reduce(
    (acc, [key, value]) => (acc[key.toLowerCase()] = value, acc),
    {} as Record<string, string | string[]>,
  )
}

export function isPlainObject(obj: any) {
  return Array.isArray(obj) || Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * 将对象排序并转为字符串 xxx=yyy&zzz=aaa，先
 */
export function sortStringify(obj: Record<string, any>) {
  return Object.entries(obj)
    .sort()
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
}

export function getBeijingTime(timestamp?: string | number | Date) {
  const time = timestamp ? new Date(timestamp) : new Date()
  const [year, monthStr, dayStr] = time.toLocaleDateString('zh-CN').split(/[/:-]/)

  return { year: parseInt(year, 10), month: parseInt(monthStr, 10), day: parseInt(dayStr, 10) }
}

export function getInToday(timestamp: string | number | Date) {
  const today = getBeijingTime()
  const time = getBeijingTime(timestamp)
  return today.day === time.day && today.month === time.month && today.year === time.year
}

export function sleepSync(time: number) {
  const start = Date.now()
  while (Date.now() - start < time) {
    // do nothing
  }
  return time
}

/**
 * 2024-09-12 20:00:48
 */
export function getTimestamp() {
  const now = new Date()
  return now.getUTCFullYear()
    + '-',
    +pad2(now.getUTCMonth() + 1)
    + '-',
    +pad2(now.getUTCDate())
    + ' ',
    // +8 时区
    +pad2(now.getUTCHours() + 8)
    + ':',
    +pad2(now.getUTCMinutes())
    + ':',
    +pad2(now.getUTCSeconds())
}

/**
 * 随机从数组中获取一个元素, 获取后删除
 */
export function randomRemove<T>(arr: T[]): T | undefined {
  return arr.splice(randomNumber(0, arr.length), 1)[0]
}

/**
 * 时间为当前月
 */
export function isCurrentMonth(time: Date | number | string) {
  return new Date(time).getMonth() === new Date().getMonth()
}

export function isString(val: any): val is string {
  return typeof val === 'string'
}

export function isUndefined(val: any): val is undefined {
  return typeof val === 'undefined'
}

export function isNullish(val: any): val is null | undefined {
  return val === null || val === undefined
}

/**
 * 隐藏手机号中某些位置
 * @description 12345678901 -> 123*56***01
 */
export function hidePhone(phone: string) {
  return phone.substring(0, 3) + '*******' + phone.substring(9)
}
