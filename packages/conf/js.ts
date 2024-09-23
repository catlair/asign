import { setIn } from '@asunajs/utils'
import { readFileSync, writeFileSync } from 'fs'
import { generateCode, loadFile, parseModule, writeFile } from 'magicast'

export async function parseJavaScript<T = any>(path: string): Promise<T> {
  const mod = await import(path)
  return (mod.default || mod) as T
}

export function setInJavaScript(
  jsCode: string,
  path: any[],
  value: any,
): string {
  const mod = parseModule(jsCode)
  setIn(mod.exports.default, path, value)
  return generateCode(mod).code
}

export function rewriteJavaScriptSync(
  filepath: string,
  path: any[],
  value: any,
) {
  const jsCode = readFileSync(filepath, 'utf8')
  writeFileSync(filepath, setInJavaScript(jsCode, path, value))
}

export async function rewriteJavaScript(
  filepath: string,
  path: any[],
  value: any,
) {
  const mod = await loadFile(filepath)
  setIn(mod.exports.default, path, value)
  return await writeFile(mod, filepath)
}
