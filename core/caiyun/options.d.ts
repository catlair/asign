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
     * 邀请码，如果不知道是啥就不管，也没用. 配置后默认助力功能失效
     */
    inviteCodes?: string[]
    /**
     * 需要给哪个好友浇水，好友 uid(果园输出的昵称后面的数字就是 uid). 浇水会消耗自己的水滴, 所有用来干嘛, 你懂的
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
  tasks?: {
    /**
     * 分享任务默认使用的文件 id，请确保该文件存在且后续不被删除
     */
    shareFile?: string
    /**
     * 跳过的任务 id，可抓包获取，也可查看日志输出（任务日志会在任务名后面拼接上数字 id 的）。切记，配置优先级最高，配置无论任务是否能够自动完成都将跳过。
     */
    skipTasks?: number[]
  }
  /**
   * 上传文件使用目录的 id，默认根目录，可按需更改，但请确认 id 有效，文件夹真实存在
   */
  catalog?: string
}
