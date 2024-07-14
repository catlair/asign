/**
 * 中国移动云盘配置
 */
export interface Caiyun {
  /**
   * cookie authorization 字段
   */
  auth: string
  /**
   * 摇一摇配置
   */
  shake?: {
    /**
     * 是否开启该功能
     */
    enable?: boolean
    /**
     * 摇一摇次数
     */
    num?: number
    /**
     * 每次间隔时间（秒）
     */
    delay?: number
  }
  /**
   * 果园配置
   */
  garden?: {
    /**
     * 是否开启该功能，需要注意的是果园需要自己去 APP 手动激活一下，否则等待你的全是报错
     */
    enable?: boolean
    /**
     * 邀请码
     */
    inviteCodes?: string[]
    /**
     * 需要给哪个好友浇水，好友 uid
     */
    waterFriend?: number
  }
  /**
   * AI 红包
   */
  aiRedPack?: {
    /**
     * 是否开启该功能
     */
    enable?: boolean
  }
  /**
   * 备份等待时间（秒）
   */
  backupWaitTime?: number
  tasks: {
    /**
     * 分享任务默认使用的文件 id
     */
    shareFile?: string
  }
  /**
   * 默认上传目录
   */
  catalog?: string
}
