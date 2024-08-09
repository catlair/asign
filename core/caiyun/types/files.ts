export interface FileListResp {
  success: boolean
  code: string
  message: string
  data: {
    items: {
      fileId: string
      parentFileId: string
      name: string
      description?: any
      type: string
      fileExtension?: string
      category: string
      createdAt: string
      updatedAt: string
      trashedAt?: any
      localCreatedAt?: any
      localUpdatedAt?: any
      starredAt?: any
      starred: boolean
      size?: number
      thumbnailUrls?: {
        style: string
        url: string
      }[]
      punishMode?: any
      systemDir: boolean
      revisionId?: string
      mediaMetaInfo?: any
      metadataAuditInfo?: MetadataAuditInfo
      contentAuditInfo?: MetadataAuditInfo
      userTags?: {
        key?: any
        value?: any
      }[]
      addressDetail?: {
        addressline?: any
        country?: any
        province?: any
        city?: any
        district?: any
        township?: any
      }
    }[]
    nextPageCursor?: any
  }
}

export interface MetadataAuditInfo {
  auditStatus: number
  auditLevel?: number
  auditResult?: number
}
