import { CAIYUN_APP_CLIENT, CAIYUN_PC_CLIENT, CAIYUN_WEB_CLIENT } from '@asign/constant'
import type { Http } from '@asign/types'
import { CHANNEL_SRC } from '../constant'
import type { DiskResult } from '../types'
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

export function getDisk(http: Http, account: string | number, catalogID: string) {
  return http.post<DiskResult>(
    `https://yun.139.com/orchestration/personalCloud/catalog/v1.0/getDisk`,
    {
      commonAccountInfo: { account: String(account) },
      catalogID,
      catalogType: -1,
      sortDirection: 1,
      catalogSortType: 0,
      contentSortType: 0,
      filterType: 0,
      startNumber: 1,
      endNumber: 100,
    },
  )
}

export function getICatalog(http: Http, phone: number | string, catalogID: string) {
  return http.post(
    'https://ose.caiyun.feixin.10086.cn/richlifeApp/devapp/ICatalog',
    `<getDisk>
   <catalogID>${catalogID}</catalogID>
   <catalogSortType>0</catalogSortType>
   <catalogType>-1</catalogType>
   <channelList></channelList>
   <contentSortType>0</contentSortType>
   <contentType>0</contentType>
   <endNumber>0</endNumber>
   <filterType>0</filterType>
   <MSISDN>${phone}</MSISDN>
   <sortDirection>1</sortDirection>
   <startNumber>-1</startNumber>
</getDisk>`,
  )
}

export function getIOutLink(http: Http, phone: number | string, file: string) {
  return http.post<string>(
    'https://share-kd-njs.yun.139.com/yun-share/richlifeApp/devapp/IOutLink',
    `<getOutLinkV3>
   <getOutLinkReq>
      <account>${phone}</account>
      <caIDLst length="0"/>
      <coIDLst length="1">
         <item>${file}</item>
      </coIDLst>
      <dedicatedName><![CDATA[]]></dedicatedName>
      <desc><![CDATA[]]></desc>
      <encrypt>1</encrypt>
      <extInfo size="1">
         <item>
            <key>shareChannel</key>
            <value>3020</value>
         </item>
      </extInfo>
      <isReturnLinkCode>1</isReturnLinkCode>
      <isUnlimitedTimes>0</isUnlimitedTimes>
      <linkType>0</linkType>
      <passwdAutoFill>0</passwdAutoFill>
      <period>1</period>
      <periodUnit>0</periodUnit>
      <pubType>1</pubType>
      <subLinkType>0</subLinkType>
   </getOutLinkReq>
</getOutLinkV3>
`,
    {
      headers: {
        'content-type': 'text/xml',
      },
    },
  )
}

type ChannelSrc = (typeof CHANNEL_SRC)[keyof typeof CHANNEL_SRC]

export interface CreateFileParams {
  parentFileId?: string
  contentHash: string
  size: number
  channelSrc?: ChannelSrc
  name: string
  opType?: OpType
}

type OpType = 'backup' | 'upload'

function getFileOpHeader(
  { channelSrc = '10000023', opType }: { channelSrc: ChannelSrc; opType?: OpType },
) {
  const base = {
    'x-yun-api-version': 'v1',
    'x-yun-app-channel': channelSrc,
    'x-yun-op-type': '1',
  }
  if (channelSrc === CHANNEL_SRC.pc) {
    return {
      ...base,
      'x-yun-market-source': '001',
      'x-yun-module-type': '100',
      'x-yun-op-type': '1',
      'x-yun-svc-type': '1',
      // x-yun-device-id
      'x-yun-client-info': CAIYUN_PC_CLIENT,
      'User-Agent': 'Mozilla/5.0',
    }
  }
  if (channelSrc === CHANNEL_SRC.android) {
    const op = opType === 'backup' ? 2 : 1

    return {
      ...base,
      'x-huawei-channelSrc': channelSrc,
      'x-yun-client-info': CAIYUN_APP_CLIENT,
      'x-yun-op-type': op.toString(),
      'x-yun-sub-op-type': (op * 100).toString(),
      // x-yun-uni
    }
  }
  return {
    ...base,
    'x-huawei-channelSrc': channelSrc || CHANNEL_SRC.web,
    'x-yun-client-info': CAIYUN_WEB_CLIENT,
    'x-yun-device-id': CAIYUN_WEB_CLIENT,
  }
}

interface FileResponse<T = any> {
  code: string
  message: string
  success: boolean
  data: T
}

export function createFile(
  http: Http,
  { name, parentFileId, contentHash, size, channelSrc, opType }: CreateFileParams,
) {
  return http.post<
    FileResponse<{
      fileId: string
      uploadId: string
      /** 是否秒传 */
      rapidUpload: boolean
      partInfos: {
        uploadUrl: string
      }[]
      exist: boolean | null
    }>
  >(
    `https://personal-kd-njs.yun.139.com/hcy/file/create`,
    {
      // contentMd5
      parentFileId: parentFileId || '/',
      name,
      type: 'file',
      size,
      // fileRenameMode: 'force_rename',
      fileRenameMode: 'auto_rename',
      contentHash,
      contentHashAlgorithm: 'SHA256',
      contentType: 'application/oct-stream',
      parallelUpload: false,
      partInfos: [{ parallelHashCtx: { partOffset: 0 }, partNumber: 1, partSize: size }],
    },
    {
      headers: {
        ...getFileOpHeader({ channelSrc, opType }),
      },
    },
  )
}

export interface CompleteFileParams {
  fileId: string
  uploadId: string
  contentHash: string
  channelSrc: ChannelSrc
  opType?: OpType
}

export function completeFile(http: Http, { channelSrc, fileId, uploadId, contentHash, opType }: CompleteFileParams) {
  return http.post<FileResponse>(
    `https://personal-kd-njs.yun.139.com/hcy/file/complete`,
    {
      fileId,
      uploadId,
      contentHash,
      contentHashAlgorithm: 'SHA256',
    },
    {
      headers: {
        ...getFileOpHeader({ channelSrc, opType }),
      },
    },
  )
}

export function putFile(http: Http, uploadUrl: string, file: Buffer | string) {
  return http.put(
    uploadUrl,
    file,
    {
      headers: {
        'content-type': 'application/octet-stream',
        'origin': 'https://yun.139.com',
        'referer': 'https://yun.139.com/',
      },
      clearHeaders: true,
      hooks: [],
    },
  )
}

export function batchTrash(http: Http, fileIds: string[]) {
  return http.post<{
    code: string
    message: string
    success: boolean
    result: {}
  }>(
    `https://personal-kd-njs.yun.139.com/hcy/recyclebin/batchTrash`,
    { fileIds },
    {
      headers: {
        ...getFileOpHeader({ channelSrc: '10000034' }),
      },
    },
  )
}
