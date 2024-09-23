import type { Http } from '@asign/types'
import { getTimestamp } from '@asign/utils-pure'
import { aiUrl } from '../constant'

interface ChatEvent {
  success: boolean
  code: string
  message: string
  data: {
    dialogueId: string
    sessionId: string
    resultType: number
    commands: string
    /**
     * 情况 一
     */
    flowResult?: {
      outContent: string
      outAuditTime: string
      outAuditStatus: number
    }
    recommend?: {
      intentionList: any[]
      contextList: any[]
      queryList: {
        type: number
        query: string
      }[]
    }
    /**
     * 情况 二, type 1 ?
     */
    leadCopy?: {
      type: number
      promptCopy: string
      buttonCopy: string
      linkURL: string
      linkName: string
    }
    text?: string
  }
}

function parseEventStream(eventStreamData: string): ChatEvent {
  const lines = eventStreamData.split('\n').filter(line => line.startsWith('data'))
  for (const line of lines) {
    return JSON.parse(line.replace('data:', ''))
  }
}

const clientInfo = '4||1|11.2.2||22041216C|||android 13|||||'

export function createAiApi(http: Http) {
  return {
    async addChat(dialogue: string, userId: string) {
      const text = await http.post<string>(
        `${aiUrl}/api/outer/assistant/chat/add`,
        {
          userId,
          sessionId: '',
          content: {
            dialogue,
            prompt: '',
            timestamp: getTimestamp(),
            commands: '',
            resourceType: '0',
            resourceId: '',
            dialogueType: '0',
            sourceChannel: '101',
            extInfo: '{"h5Version":"1.3.0"}',
            imageSortType: 1,
          },
          applicationType: 'chat',
          applicationId: '',
        },
        {
          headers: {
            'x-yun-client-info': clientInfo,
            'Content-Type': 'application/json',
            'accept': 'text/event-stream',
            'x-yun-api-version': 'v4',
            'Origin': 'https://yun.139.com',
            'X-Requested-With': 'com.chinamobile.mcloud',
            'Referer': 'https://yun.139.com/',
          },
        },
      )
      return parseEventStream(text)
    },
    submitAccredit() {
      return http.post(`${aiUrl}/api/outer/assistant/accredit/submit`, { sourceBusiness: 1 }, {
        headers: {
          'x-yun-api-version': 'v1',
          'x-yun-app-channel': '101',
          'x-yun-client-info': clientInfo,
        },
      })
    },
  }
}
