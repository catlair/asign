import { generateMarkdown, generateTypescripts, getDefulat, z } from '@asign/typed'
import { writeFileSync } from 'fs'

export const config = z.object({
  auth: z.string().describe('cookie authorization 字段'),
  shake: z.object({
    enable: z.boolean().default(true).optional().describe('是否开启该功能'),
    num: z.number().default(15).optional().describe('摇一摇次数'),
    delay: z.number().default(2).optional().describe('每次间隔时间（秒）'),
  }).optional().describe('摇一摇配置'),
  garden: z.object({
    enable: z.boolean().default(true).optional().describe(
      '是否开启该功能，需要注意的是果园需要自己去 APP 手动激活一下，否则等待你的全是报错',
    ),
    inviteCodes: z.array(z.string()).optional().describe('邀请码'),
    waterFriend: z.number().optional().describe('需要给哪个好友浇水，好友 uid'),
  }).optional().describe('果园配置'),
  aiRedPack: z.object({
    enable: z.boolean().default(true).optional().describe('是否开启该功能'),
  }).optional().describe('AI 红包'),
  backupWaitTime: z.number().default(20).optional().describe('备份等待时间（秒）'),
  tasks: z.object({
    shareFile: z.string().optional().describe('分享任务默认使用的文件 id'),
  }),
  catalog: z.string().optional().describe('默认上传目录').default('00019700101000000001'),
}).describe('中国移动云盘配置')

const types = {
  caiyun: config,
}

export const markdown = generateMarkdown(config, 'caiyun')

export const defuConfig = getDefulat(config)

writeFileSync('./options.d.ts', await generateTypescripts(types), 'utf-8')

writeFileSync('./options.md', markdown, 'utf-8')

writeFileSync('./options.ts', `export const defuConfig = ${JSON.stringify(defuConfig, null, 2)}`, 'utf-8')
