import { unlinkSync, writeFileSync } from 'node:fs'
import { createStorage, prefixStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs-lite'
import memoryDriver from 'unstorage/drivers/memory'
export async function getStorage(prefix: string) {
  const storage = createStorage({
    driver: canWrite() ? fsDriver({ base: './.temp/asign' }) : memoryDriver(),
  })
  return prefixStorage(storage, prefix)
}

/**
 * 判断当前是否拥有写入文件的权限
 */
export function canWrite() {
  try {
    const file = 'asign_file_write.txt'
    writeFileSync(file, file)
    unlinkSync(file)
    return true
  } catch {
    return false
  }
}
