import type { Http } from '@asign/types'
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
