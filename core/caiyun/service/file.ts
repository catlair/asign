import { randomHex, randomNumber, setStoreArray } from '@asign/utils-pure'
import { sha256 } from '@asunajs/utils'
import { Buffer } from 'node:buffer'
import { completeFile, createFile, type CreateFileParams, putFile } from '../api/file.js'
import type { M } from '../types.js'

type UploadFileOptions = Partial<CreateFileParams> & {
  ext?: string
}

export async function uploadFileRequest(
  $: M,
  { name, parentFileId, channelSrc, size, ext, contentHash }: UploadFileOptions,
) {
  try {
    size || (size = randomNumber(1, 1000))
    name || (name = 'asign-' + randomHex(4) + (ext || '.png'))
    const { data, code, message, success } = await createFile($.http, {
      name,
      parentFileId,
      contentHash,
      size,
      channelSrc,
    })

    if (!success) {
      $.logger.error(`上传文件请求失败`, code, message)
      return {}
    }

    const { exist, rapidUpload, uploadId, fileId, partInfos } = data

    if (exist) {
      $.logger.debug(`文件已存在`)
      return {}
    }

    if (rapidUpload) {
      $.logger.debug(`急速上传`)
      setStoreArray($.store, 'files', [fileId])
      return {
        fileId,
      }
    }

    return {
      uploadId,
      fileId,
      uploadUrl: partInfos[0].uploadUrl,
    }
  } catch (error) {
    $.logger.error(`上传文件请求异常`, error)
  }

  return {}
}

export async function uploadFile(
  $: M,
  options: UploadFileOptions,
  file: Buffer | string,
) {
  try {
    const contentHash = sha256(file)
    const size = typeof file === 'string' ? file.length : file.byteLength
    const { uploadUrl, uploadId, fileId } = await uploadFileRequest($, { ...options, contentHash, size })

    if (!uploadUrl || !fileId) {
      return false
    }

    $.logger.debug('别着急，文件上传中。。。')
    const uploadFileResp = await putFile($.http, uploadUrl, file)
    if (uploadUrl.includes('<')) {
      $.logger.error(`上传文件失败`, uploadFileResp)
      return false
    }

    setStoreArray($.store, 'files', [fileId])

    $.logger.debug(`上传文件成功 1`)

    const { success, code, message } = await completeFile($.http, {
      fileId,
      uploadId,
      contentHash,
      channelSrc: options.channelSrc,
    })

    if (!success) {
      $.logger.error(`上传文件失败`, code, message)
      return false
    }

    $.logger.debug(`上传文件成功 2`)
  } catch (error) {
    $.logger.error(`上传文件异常`, error)
  }
  return false
}

export async function uploadRandomFile($: M, options?: UploadFileOptions) {
  try {
    const buffer = randomHex(32)
    return await uploadFile($, { ...options, parentFileId: $.config.catalog }, buffer)
  } catch (error) {
    $.logger.error(`uploadRandomFile 异常`, error)
  }
}

export function getBackParentCatalogID() {
  return '/'
}
