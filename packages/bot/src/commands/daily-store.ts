import { resolve } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

import { CQ } from 'go-cqwebsocket'
import { createRequest } from '../utils/request'
import type { ScreenshotQueue } from '../utils/screenshot-queue'

async function fetchIsBind(qq: number, alias: string) {
  const request = createRequest(qq)
  const response = await request('/account/is-bind', { body: { alias } })
  return response
}

export async function dailyStoreCommand(
  screenshotQueue: ScreenshotQueue,
  qq: number,
  alias: string = 'default',
) {
  const isBind = await fetchIsBind(qq, alias)

  if (!isBind.success) {
    return isBind.message
  }

  const date = new Date().toLocaleDateString('fr-CA', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })

  const storageDir = process.env.VALORANT_BOT_SCREENSHOT_STORAGE_DIR_PATH
  const dir = storageDir
    ? storageDir
    : resolve(import.meta.dirname!, `../../screenshots/${qq}/${date}`)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const imageStorePath = resolve(dir, `daily-store-${alias}.png`)

  if (existsSync(imageStorePath)) {
    return [CQ.image(`file:///${imageStorePath}`)]
  }

  const url = `${process.env.VALORANT_WEBSITE_URL}/daily-store?qq=${btoa(qq.toString())}&alias=${alias}`
  await screenshotQueue.addToQueue(url, imageStorePath)

  return [CQ.image(`file:///${imageStorePath}`)]
}
