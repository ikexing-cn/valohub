import { env } from 'node:process'

export function bindCommand(userId: number, alias: string = 'default'): string {
  return `请打开以下链接进行绑定：${env.VALORANT_WEBSITE_URL}/bind?qq=${btoa(userId.toString())}&alias=${alias}`
}
