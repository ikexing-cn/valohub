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

function getDate() {
  const now = new Date()
  const eightTenAM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    8,
    10,
    0,
  )

  // Check if the current time is greater than or equal to 8:10 AM
  const dateToUse =
    now >= eightTenAM ? now : new Date(now.setDate(now.getDate() - 1))

  // Format the date as YYYY-MM-DD
  const year = dateToUse.getFullYear()
  const month = (dateToUse.getMonth() + 1).toString().padStart(2, '0')
  const day = dateToUse.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
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

  const storageDir = process.env.VALORANT_BOT_SCREENSHOT_STORAGE_DIR_PATH
  const dir = storageDir
    ? storageDir
    : resolve(import.meta.dirname!, `../../screenshots`)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const imageStorePath = resolve(
    dir,
    `/${qq}/${getDate()}/daily-store-${alias}.png`,
  )

  if (existsSync(imageStorePath)) {
    return [CQ.image(`file:///${imageStorePath}`)]
  }

  const url = `${process.env.VALORANT_WEBSITE_URL}/daily-store?qq=${btoa(qq.toString())}&alias=${alias}`
  await screenshotQueue.addToQueue(url, imageStorePath)

  return [CQ.image(`file:///${imageStorePath}`)]
}
