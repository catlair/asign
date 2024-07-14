import { createTime as _createTime, getXmlElement, randomHex, randomNumber, setStoreArray } from '@asign/utils-pure'
import type { UploadXml } from '../api.js'
import type { M } from '../types.js'

export * from './aiRedPack.js'

type UploadFileOptions = Partial<UploadXml> & { ext?: string }

export async function uploadFileRequest(
  $: M,
  parentCatalogID: string,
  {
    ext = '.png',
    digest = randomHex(32).toUpperCase(),
    contentSize = randomNumber(1, 1000) as number | string,
    manualRename = 2,
    contentName = 'asign-' + randomHex(4) + ext,
    createTime = _createTime(),
    ...options
  } = {},
  needUpload?: boolean,
): Promise<{
  contentID?: string
  redirectionUrl?: string
  uploadTaskID?: string
  contentName?: string
}> {
  try {
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
    digest = randomHex(32).toUpperCase(),
    contentSize = randomNumber(1, 1000) as number | string,
    manualRename = 2,
    contentName = 'asign-' + randomHex(4) + ext,
    createTime = _createTime(),
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
    const buffer = randomHex(32)
    return await uploadFile($, $.config.catalog, { ...options, digest: $.md5(buffer) }, buffer)
  } catch (error) {
    $.logger.error(`uploadRandomFile 异常`, error)
  }
}

export async function pcUploadFileRequest($: M, path: string) {
  try {
    const { success, message, data } = await $.api.pcUploadFileRequest(
      $.config.phone,
      path,
      0,
      'asign' + randomHex(4) + '.png',
      'd41d8cd98f00b204e9800998ecf8427e',
    )
    if (success && data && data.uploadResult) {
      return data.uploadResult.newContentIDList.map(
        ({ contentID }) => contentID,
      )
    }
    $.logger.error(`上传文件请求失败`, message)
  } catch (error) {
    $.logger.error(`上传文件请求异常`, error)
  }
}

export function getBackParentCatalogID() {
  return '00019700101000000043'
}
