/**
 * 中国移动云盘配置
 */
export interface Caiyun {
  /**
   * cookie authorization 字段
   */
  auth: string
  /**
   * 昵称，用于获取用户信息
   */
  nickname?: string
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
     * 活动下线
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
    /**
     * 是否开启果园助力功能，可能即将废弃
     */
    开启果园助力?: boolean
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
  /**
   * 云手机红包派对
   */
  cloudPhoneRedpack?: {
    /**
     * 是否开启该功能
     */
    enable?: boolean
  }
  /**
   * 是否打印今日云朵
   */
  是否打印今日云朵?: boolean
  /**
   * 剩余多少天刷新token
   */
  剩余多少天刷新token?: number
  /**
   * 微信抽奖配置
   */
  微信抽奖?: {
    /**
     * 微信抽奖次数
     */
    次数?: number
    /**
     * 微信抽奖间隔（毫秒）
     */
    间隔?: number
  }
  /**
   * 云朵大作战
   */
  云朵大作战?: {
    /**
     * 目标排名
     */
    目标排名?: number
    /**
     * 是否开启兑换
     */
    开启兑换?: boolean
    /**
     * 邀请用户的手机号（你邀请的用户，不是邀请你的）
     */
    邀请用户: string[]
  }
}
