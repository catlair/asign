import type { Http } from '@asign/types'
import type { Info, SignResult } from './types.js'

export function createApi(http: Http) {
  const driveUrl = 'https://drive-m.quark.cn/1/clouddrive/capacity/growth'

  return {
    getInfo(query: string) {
      return http.get<Info>(`${driveUrl}/info?${query}`)
    },
    sign(query: string) {
      return http.post<SignResult>(`${driveUrl}/sign?${query}`, {
        sign_cyclic: true,
      })
    },
  }
}

export type ApiType = ReturnType<typeof createApi>
