import {
  createTime as _createTime,
  getXmlElement,
  isWps,
  randomHex,
  randomNumber,
  setStoreArray,
} from '@asign/utils-pure'
import type { UploadXml } from '../api.js'
import type { M } from '../types.js'

export * from './ai-redpack.js'

type UploadFileOptions = Partial<UploadXml> & { ext?: string }

export async function uploadFileRequest(
  $: M,
  parentCatalogID: string,
  {
    ext = '.png',
    digest,
    contentSize,
    manualRename = 2,
    contentName,
    createTime,
    ...options
  } = {} as UploadFileOptions,
  needUpload?: boolean,
): Promise<{
  contentID?: string
  redirectionUrl?: string
  uploadTaskID?: string
  contentName?: string
}> {
  try {
    digest || (digest = randomHex(32).toUpperCase())
    createTime || (createTime = _createTime())
    contentSize || (contentSize = randomNumber(1, 1000))
    contentName || (contentName = 'asign-' + randomHex(4) + ext)
    const xml = await $.api.uploadFileRequest(
      {
        phone: $.config.phone,
        parentCatalogID,
        contentSize,
        createTime,
        digest,
        manualRename,
        contentName,
        ...options,
      },
    )
    const isNeedUpload = getXmlElement(xml, 'isNeedUpload')

    const contentID = getXmlElement(xml, 'contentID')
    if (isNeedUpload === '1') {
      if (needUpload) {
        return {
          redirectionUrl: getXmlElement(xml, 'redirectionUrl'),
          uploadTaskID: getXmlElement(xml, 'uploadTaskID'),
          contentName: getXmlElement(xml, 'contentName'),
          contentID,
        }
      }
      $.logger.fail('未找到该文件，该文件需要手动上传')
      return {}
    }
    if (contentID) {
      contentID && setStoreArray($.store, 'files', [contentID])
      return {
        contentID,
      }
    }
    $.logger.error(`上传文件请求失败`, xml)
  } catch (error) {
    $.logger.error(`上传文件请求异常`, error)
  }
  return {}
}

export async function uploadFile(
  $: M,
  parentCatalogID: string,
  {
    ext = '.png',
    digest,
    contentSize,
    manualRename = 2,
    contentName,
    createTime,
    ...options
  } = {} as UploadFileOptions,
  file: Buffer | string,
) {
  try {
    const { redirectionUrl, uploadTaskID, contentID } = await uploadFileRequest($, parentCatalogID, {
      ext,
      digest,
      contentSize,
      manualRename,
      contentName,
      createTime,
      ...options,
    }, true)
    if (!redirectionUrl || !file) {
      return Boolean(contentID)
    }
    const size = typeof file === 'string' ? file.length : file.byteLength
    $.logger.debug('别着急，文件上传中。。。')
    const xml = await $.api.uploadFile(redirectionUrl.replace(/&amp;/g, '&'), uploadTaskID, file, size)
    const resultCode = getXmlElement(xml, 'resultCode')
    switch (resultCode) {
      case '0':
        contentID && setStoreArray($.store, 'files', [contentID])
        $.logger.debug(`上传文件成功`)
        return true
      case '9119':
        $.logger.fail(`上传文件失败：md5校验失败`)
        return false
      default:
        $.logger.error(`上传文件失败`, xml)
        return false
    }
  } catch (error) {
    $.logger.error(`上传文件异常`, error)
  }
  return false
}

export async function uploadRandomFile($: M, options?: UploadFileOptions) {
  try {
    if (isWps()) {
      const map = [
        { key: '1', value: 'c4ca4238a0b923820dcc509a6f75849b' },
        { key: '2', value: 'c81e728d9d4c2f636f067f89cc14862c' },
        { key: '3', value: 'eccbc87e4b5ce2fe28308fd9f2a7baf3' },
        { key: '123', value: '202cb962ac59075b964b07152d234b70' },
      ]
      const r = randomNumber(0, map.length)
      return await uploadFile($, $.config.catalog, { digest: map[r].value }, map[r].key)
    }
    const buffer = randomHex(32)
    return await uploadFile($, $.config.catalog, { ...options, digest: $.md5(buffer) }, buffer)
  } catch (error) {
    $.logger.error(`uploadRandomFile 异常`, error)
  }
}

export function getBackParentCatalogID() {
  return '00019700101000000043'
}
