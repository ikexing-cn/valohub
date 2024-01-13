import { resolve } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

import { CQ } from 'go-cqwebsocket'
import type { Page } from 'puppeteer'

export async function dailyStoreCommand(
  qq: number,
  page: Page,
  alias: string = 'default',
) {
  const date = new Date()
    .toLocaleDateString('fr-CA', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    })
    .replaceAll('/', '-')

  const dir = resolve(import.meta.dirname!, `../../screenshots/${qq}/${date}`)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const imagePath = resolve(dir, `daily-store-${alias}.png`)

  if (existsSync(imagePath)) {
    return [CQ.image(`file:///${imagePath}`)]
  }

  await page.goto(
    `${process.env.VALORANT_WEBSITE_URL}/daily-store?qq=${btoa(
      qq.toString(),
    )}&alias=${alias}`,
    { waitUntil: 'networkidle0' },
  )

  await page.screenshot({
    path: imagePath,
    type: 'png',
    clip: {
      x: 0,
      y: 0,
      height: 370,
      width: 700,
    },
  })

  return [CQ.image(`file:///${imagePath}`)]
}
