import { resolve } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

import { CQ } from 'go-cqwebsocket'
import { createRequest } from '../utils/request'
import type { ScreenshotQueue } from '../utils/screenshot-queue'

async function fetchIsBind(qq: number, alias: string) {
  const request = createRequest(qq)
  const response = await request('/account/is-bind', { body: { alias } })
  return response.success
}

export async function dailyStoreCommand(
  screenshotQueue: ScreenshotQueue,
  qq: number,
  alias: string = 'default',
) {
  const isBind = await fetchIsBind(qq, alias)
  if (!isBind) {
    return `${
      alias === 'default' ? '此 qq 尚未绑定, ' : `别名 "${alias}" 尚未绑定, `
    }请私信 Bot 好友后使用 "绑定" 指令进行绑定`
  }

  const date = new Date().toLocaleDateString('fr-CA', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })

  const dir = resolve(import.meta.dirname!, `../../screenshots/${qq}/${date}`)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const imageStorePath = resolve(dir, `daily-store-${alias}.png`)

  if (existsSync(imageStorePath)) {
    return [CQ.image(`file:///${imageStorePath}`)]
  }

  const url = `${process.env.VALORANT_WEBSITE_URL}/daily-store?qq=${btoa(qq.toString())}&alias=${alias}`
  await screenshotQueue.addToQueue(url, imageStorePath)

  return [CQ.image(`file:///${imageStorePath}`)]
}
