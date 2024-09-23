import { setIn } from '@asunajs/utils'
import { readFileSync, writeFileSync } from 'fs'
import { extname } from 'path'
import { setInJavaScript } from './js'
import { parseObject, setInObject } from './object'

export function setInConfig(filepath: string, path: any[], value: any): string {
  const code = readFileSync(filepath, 'utf8')
  switch (extname(filepath)) {
    case '.json': {
      const json = parseObject(code)
      setIn(json, path, value)
      return JSON.stringify(json, null, 2)
    }
    case '.json5':
      return setInObject(code, path, value)
    case '.js':
    case '.ts':
    case '.mjs':
    case '.mts':
    case '.cjs':
    case '.cts':
      return setInJavaScript(code, path, value)
    default:
      return
  }
}

export function rewriteConfigSync(filepath: string, path: any[], value: any) {
  try {
    const code = setInConfig(filepath, path, value)
    if (code) {
      writeFileSync(filepath, code)
    }
  } catch (error) {
    console.error(error)
  }
}
