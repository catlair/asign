import { generateMarkdown, generateTypescripts, z } from '@asign/typed'
import { writeFileSync } from 'fs'

export const config = z.object({
  kps: z.string(),
  sign: z.string(),
  vcode: z.string(),
}).describe('阿里云盘配置')

const types = {
  quark: config,
}

export const markdown = generateMarkdown(config, 'quark')

writeFileSync('./options.d.ts', await generateTypescripts(types), 'utf-8')

writeFileSync('./options.md', markdown, 'utf-8')
