import { generateMarkdown, generateTypescripts, getDefulat, z } from '@asign/typed'
import { writeFileSync } from 'fs'

export const config = z.object({
  auth: z.string().describe('cookie authorization 字段'),

  nickname: z.string().optional().describe('昵称，用于获取用户信息'),

  shake: z.object({
    enable: z.boolean().default(true).optional().describe('是否开启该功能'),
    num: z.number().default(15).optional().describe('摇一摇次数'),
    delay: z.number().default(2).optional().describe('每次间隔时间（秒）'),
  }).optional().describe('摇一摇配置'),

  garden: z.object({
    enable: z.boolean().default(true).optional().describe(
      '是否开启该功能，需要注意的是果园需要自己去 APP 手动激活一下，否则等待你的全是报错',
    ),
    inviteCodes: z.array(z.string()).optional().describe(
      '邀请码，如果不知道是啥就不管，也没用. 配置后默认助力功能失效',
    ),
    waterFriend: z.number().optional().describe(
      '需要给哪个好友浇水，好友 uid(果园输出的昵称后面的数字就是 uid). 浇水会消耗自己的水滴, 所有用来干嘛, 你懂的',
    ),
    开启果园助力: z.boolean().default(false).optional().describe('是否开启果园助力功能，可能即将废弃'),
  }).optional().describe('果园配置'),

  aiRedPack: z.object({
    enable: z.boolean().default(true).optional().describe('是否开启该功能'),
  }).optional().describe('AI 红包'),

  backupWaitTime: z.number().default(20).optional().describe('备份等待时间（秒）'),

  tasks: z.object({
    shareFile: z.string().optional().describe('分享任务默认使用的文件 id，请确保该文件存在且后续不被删除'),
    skipTasks: z.array(z.number()).optional().describe(
      '跳过的任务 id，可抓包获取，也可查看日志输出（任务日志会在任务名后面拼接上数字 id 的）。切记，配置优先级最高，配置无论任务是否能够自动完成都将跳过。',
    ),
  }).optional(),

  catalog: z.string().optional().describe(
    '上传文件使用目录的 id，默认根目录，可按需更改，但请确认 id 有效，文件夹真实存在',
  ).default('00019700101000000001'),

  cloudPhoneRedpack: z.object({
    enable: z.boolean().default(false).optional().describe('是否开启该功能'),
  }).optional().describe('云手机红包派对'),

  是否打印今日云朵: z.boolean().optional().describe('是否打印今日云朵').default(true),

  剩余多少天刷新token: z.number().default(10).optional().describe('剩余多少天刷新token'),

  微信抽奖: z.object({
    次数: z.number().default(1).optional().describe('微信抽奖次数'),
    间隔: z.number().default(500).optional().describe('微信抽奖间隔（毫秒）'),
  }).optional().describe('微信抽奖配置'),

  云朵大作战: z.object({
    目标排名: z.number().default(500).optional().describe('目标排名'),
    开启兑换: z.boolean().default(false).optional().describe('是否开启兑换'),
    邀请用户: z.array(z.string()).describe('邀请用户的手机号（你邀请的用户，不是邀请你的）'),
  }).optional().describe('云朵大作战'),
}).describe('中国移动云盘配置')

const types = {
  caiyun: config,
}

export const markdown = generateMarkdown(config, 'caiyun')

export const defuConfig = getDefulat(config)

writeFileSync('./options.d.ts', await generateTypescripts(types), 'utf-8')

writeFileSync('./options.md', markdown, 'utf-8')

writeFileSync('./options.ts', `export const defuConfig = ${JSON.stringify(defuConfig, null, 2)}`, 'utf-8')
