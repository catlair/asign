export type CloudPhone<T> = {
  header: RespHeader
  data: T
}

export interface ConfigTaskList {
  configTaskSignList: ConfigTaskSignList[]

  configTaskNoviceList: ConfigTaskNoviceList[]

  configTaskDailyList: ConfigTaskDailyList[]

  configTaskMonthlyList: ConfigTaskMonthlyList[]

  configTaskBuyList: any[]

  totalSignTimes: number

  iconUrl: string

  iconLink: string
}

export interface ConfigTaskMonthlyList {
  id: string

  configType: number

  taskType: string

  taskCode: string

  taskName: string

  taskLogo: string

  taskExplain: string

  periodCanNum: number

  prizeType: number

  prizeName: string

  prizeAmount: string

  prizeAmountMany: string

  sort: number

  createTime: string

  updateTime: string

  userStatus: number

  userCompleteNum: number

  userCanCompleteNum: number

  jumpLink?: string
}

export interface ConfigTaskDailyList {
  id: string

  configType: number

  taskType: string

  taskCode: string

  taskName: string

  taskLogo: string

  taskExplain: string

  periodCanNum: number

  prizeType: number

  prizeName: string

  prizeAmount: string

  prizeAmountMany: string

  sort: number

  createTime: string

  updateTime: string

  userStatus: number

  userCompleteNum: number

  userCanCompleteNum: number
}

export interface ConfigTaskNoviceList {
  id: string

  configType: number

  taskType: string

  taskCode: string

  taskName: string

  taskLogo: string

  taskExplain: string

  periodCanNum: number

  prizeType: number

  prizeName: string

  prizeAmount: string

  prizeAmountMany: string

  jumpLink: string

  sort: number

  createTime: string

  updateTime: string

  userStatus: number

  userCompleteNum: number

  userCanCompleteNum: number
}

export interface ConfigTaskSignList {
  date: string

  day: number

  signAmount: string

  status: number

  isToday: number

  isWeek: number
}

export interface RespHeader {
  appId: string

  requestId: string

  status: string

  errMsg: string
}

export type UserAccountInfo = {
  info: {
    id: string
    account: string
    totalAmount: string
    canAmount: string
    createTime: string
    updateTime: string
  }
}
