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
    flowResult: {
      outContent: string
      outAuditTime: string
      outAuditStatus: number
    }
    recommend: {
      intentionList: any[]
      contextList: any[]
      queryList: {
        type: number
        query: string
      }[]
    }
  }
}

function parseEventStream(eventStreamData: string): ChatEvent {
  const lines = eventStreamData.split('\n').filter(line => line.startsWith('data'))
  for (const line of lines) {
    return JSON.parse(line.replace('data:', ''))
  }
}

export function createAiApi(http: Http) {
  return {
    async addChat(dialogue: string) {
      const text = await http.post<string>(
        `${aiUrl}/api/outer/assistant/chat/add`,
        {
          userId: '',
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
            'x-yun-client-info': '1||1|11.2.2||22041216C|||android 13|||||',
            'Content-Type': 'application/json',
            'accept': 'text/event-stream',
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 13; 22041216C Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.88 Mobile Safari/537.36 MCloudApp/11.2.2',
            'x-yun-api-version': 'v4',
            'Origin': 'https://yun.139.com',
            'X-Requested-With': 'com.chinamobile.mcloud',
            'Referer': 'https://yun.139.com/',
          },
        },
      )
      return parseEventStream(text)
    },
  }
}
