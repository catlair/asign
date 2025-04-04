import { loadConfig, rewriteConfigSync } from '@asunajs/conf'

export async function getConfig() {
  return await loadConfig()
}

export async function patchConfig(path: any[], value: any): Promise<Error> {
  const { path: filepath } = await loadConfig()

  return rewriteConfigSync(filepath, path, value) as Error
}
