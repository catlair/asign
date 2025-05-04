import type { Http } from '@asign/types'
import { caiyunUrl } from '../constant'

export function reqAction(http: Http, op = 'currentTimeMillis') {
  return http.post<{ /** 10000 **/ code: number; /** success */ msg: string; result: number }>(
    `${caiyunUrl}/portal/ajax/tools/opRequest.action`,
    { op },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
    },
  )
}
