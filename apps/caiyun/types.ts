import type { M } from '@asign/caiyun-core'
import type { LoggerType } from '@asign/types'
import type { getStorage } from '@asign/unstorage'

export type Config = M['config']
export type Option = { localStorage?: Awaited<ReturnType<typeof getStorage>>; logger: LoggerType; jwtToken?: string }
export type UserConfig = {
  config: Config[]
  message?: Record<string, any>
  path?: string
}
