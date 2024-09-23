import { isCurrentMonth } from '@asign/utils-pure'
import type { M } from '../types'

interface LocalStorage {
  lastUpdate: number
  count: number
}

export async function setDataNum($: M, key: string, num: number) {
  if (!num) return

  await $.localStorage.setItem(key, {
    count: num,
    lastUpdate: new Date(),
  })
}

export async function addDataNum($: M, key: string, num?: number | void) {
  if (!num) return
  await setDataNum($, key, num += await getDataNum($, key))
  return num
}

export async function getDataNum($: M, key: string) {
  const data = await $.localStorage.getItem<LocalStorage>(key)
  if (!data) return 0
  return isCurrentMonth(data.lastUpdate) ? data.count : 0
}
