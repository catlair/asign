import type { BaseType } from '../types'

export type Hecheng1T = BaseType<{
  history: History
  info: Info
}>

interface Info {
  phone: string
  inner: number
  stage: number
  curr: number
  exchange: number
  invite: number
  succ: number
  lastSucc: string
  flag: boolean
}

interface History {
  '0': _0
  '-1': _0
  '-2': _0
}

interface _0 {
  count: string
  rank: string
}
