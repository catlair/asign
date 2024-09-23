import { createCipheriv, randomBytes } from 'crypto'

function aesEecrypt(textUtf8: string, iv: Buffer): Buffer {
  const decipher = createCipheriv('aes-128-cbc', Buffer.from('xuL97!x7GGxG%8V4', 'utf-8'), iv)

  return Buffer.concat([decipher.update(textUtf8, 'utf-8'), decipher.final()])
}

export function encryptAiUserId(userId: string) {
  const iv = randomBytes(16)
  return Buffer.from(Buffer.concat([iv, aesEecrypt(userId, iv)]).toString('base64'), 'utf-8').toString('base64')
}
