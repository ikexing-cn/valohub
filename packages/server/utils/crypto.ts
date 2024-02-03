import { env } from 'node:process'
import { Buffer } from 'node:buffer'
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto'

const algorithm: string = 'aes-256-cbc'
const secretKey = env.VALORANT_SERVER_SECRET_KEY?.trim() || 'YOUR_SECRET_STRING_HAVING_32_CHARS'

const hashSecretKey = createHash('sha256').update(secretKey).digest()

export function encrypt(text: string): { iv: string, content: string } {
  const iv: Buffer = randomBytes(16)

  const cipher = createCipheriv(algorithm, hashSecretKey, iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
  }
}

export function decrypt(hash: { iv: string, content: string }): string {
  const decipher = createDecipheriv(
    algorithm,
    hashSecretKey,
    Buffer.from(hash.iv, 'hex'),
  )
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, 'hex')),
    decipher.final(),
  ])
  return decrypted.toString()
}
