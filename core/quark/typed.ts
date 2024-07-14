import { generateMarkdown, generateTypescripts, z } from '@asign/typed'
import { writeFileSync } from 'fs'

export const config = z.object({
  sign: z.string().describe('sign url').describe(
    'https://drive-m.quark.cn/1/clouddrive/capacity/growth/sign?kps=xxxxxxxxxxx',
  ),
  info: z.string().describe('info url').describe(
    'https://drive-m.quark.cn/1/clouddrive/capacity/growth/info?__t=xxxxxxxxxxx',
  ),
}).describe('阿里云盘配置')

const types = {
  quark: config,
}

export const markdown = generateMarkdown(config, 'quark')

writeFileSync('./options.d.ts', await generateTypescripts(types), 'utf-8')

writeFileSync('./options.md', markdown, 'utf-8')
