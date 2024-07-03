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

export function getAuthInfo(basicToken: string) {
  basicToken = basicToken.replace('Basic ', '')

  const rawToken = Buffer.from(basicToken, 'base64').toString('utf-8')
  const [platform, phone, token] = rawToken.split(':')

  return {
    phone,
    token,
    auth: `Basic ${basicToken}`,
    platform,
  }
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
  return globalThis.setTimeout === undefined && globalThis.HTTP
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
