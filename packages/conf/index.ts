export * from './js.js'
export * from './object.js'
export * from './utils.js'

import { existsSync, readFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseJavaScript } from './js.js'
import { parseObject } from './object.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * 获取运行文件所在目录
 */
function _getFileDir() {
  try {
    if (['.js', '.mjs', '.cjs'].find(ext => ext === extname(process.argv[1]))) {
      return dirname(process.argv[1])
    }
  } catch {}
  return __dirname
}

/**
 * 获取配置文件路径
 * 配置文件可能有以下几种地方：
 * 1. cwd()
 * 2. 运行文件的目录
 * 3. cwd() -> ./config
 * 4. 运行文件的目录 -> ./config
 * 配置文件可能文件名
 * asign.json asign.json5
 * asign.config.{js,cjs,mjs}
 * @returns 找到第一个存在的路径
 */

export function getConfigPath() {
  const cwd = process.cwd()
  const files = [
    'asign.json',
    'asign.json5',
    'asign.config.js',
    'asign.config.mjs',
    'asign.config.cjs',
  ]
  const dirname = _getFileDir()
  const dirs = [cwd, `${cwd}/config`, dirname, `${dirname}/config`]

  for (const dir of dirs) {
    for (const file of files) {
      if (existsSync(join(dir, file))) return `${dir}/${file}`
    }
  }
}

export async function parseConfig<T = any>(path: string): Promise<T> {
  switch (extname(path)) {
    case '.json':
    case '.json5':
      return parseObject(readFileSync(path, 'utf8'))
    case '.js':
    case '.mjs':
    case '.cjs':
      return await parseJavaScript(path)
    default:
      return
  }
}

export async function loadConfig<T = any>(
  path?: string,
): Promise<{
  path: string
  config: T
}> {
  if (path && !existsSync(path)) {
    throw new Error('找不到配置文件')
  }
  const configPath = path || getConfigPath()
  if (!configPath) {
    throw new Error('找不到配置文件')
  }
  const config = await parseConfig(configPath)

  return {
    path: configPath,
    config,
  }
}
