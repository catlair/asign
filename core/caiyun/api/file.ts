import type { Http } from '@asign/types'
import type { FileListResp } from '../types/files'

/**
 * 获取文件列表
 */
export function getFileList(http: Http) {
  return http.post<FileListResp>('https://personal-kd-njs.yun.139.com/hcy/file/list', {
    pageInfo: {
      pageSize: 100,
      pageCursor: null,
    },
    orderBy: 'updated_at',
    orderDirection: 'DESC',
    parentFileId: '/',
    imageThumbnailStyleList: [
      'Small',
      'Large',
    ],
  }, {
    headers: {
      'x-yun-api-version': 'v1',
      'x-yun-app-channel': '10000034',
      'x-yun-client-info': '||9|7.13.6|edge||||linux unknow||zh-CN|||ZWRnZQ==||',
    },
  })
}
