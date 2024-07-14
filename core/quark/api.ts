import type { Http } from '@asign/types'
import type { Info, SignResult } from './types.js'

export function createApi(http: Http) {
  return {
    getInfo(url: string) {
      return http.get<Info>(url)
    },
    sign(url: string) {
      return http.post<SignResult>(url, {
        sign_cyclic: true,
      })
    },
  }
}

export type ApiType = ReturnType<typeof createApi>
