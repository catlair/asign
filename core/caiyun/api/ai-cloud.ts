import type { Http } from '@asign/types'
import { aiXtUrl } from '../constant/index.js'
import type { BaseType } from '../types.js'

export interface AiCloudBaseOptions {
  userId: string
}

export interface AiCloudPreOptions extends AiCloudBaseOptions {
  sessionId: string
  dialogueId: string
}

export interface AiCloudRewardOptions extends AiCloudBaseOptions {
  recordId: number
}

export function getCloudRewardApi(http: Http, options: AiCloudRewardOptions) {
  return http.post<BaseType<number>>(`${aiXtUrl}/playAiClouds/getCloudReward`, options)
}

/**
 * 52105 - 为抽中云朵奖励
 */
export function getPreCloudRewardApi(http: Http, options: AiCloudPreOptions & { type?: number }) {
  return http.post<
    BaseType<{
      recordId: number
      sceneType: 3
      cloudNum: number
    }>
  >(`${aiXtUrl}/playAiClouds/getPreCloudReward`, { type: 0, ...options }, {
    headers: {
      'X-Requested-With': 'com.chinamobile.mcloud',
      'Referer': 'https://yun.139.com/ai-helper/',
    },
  })
}
