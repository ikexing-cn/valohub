import { resolve } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

import { CQ } from 'go-cqwebsocket'
import { createRequest } from '../utils/request'
import type { Page } from 'puppeteer'

async function fetchIsBind(qq: number, alias: string) {
  const request = createRequest(qq)
  const response = await request('/account/is-bind', { body: { alias } })
  return response.success
}

export async function dailyStoreCommand(
  page: Page,
  qq: number,
  alias: string = 'default',
) {
  const isBind = await fetchIsBind(qq, alias)
  if (!isBind) {
    return `${
      alias === 'default' ? '此 qq 尚未绑定, ' : `别名 "${alias}" 尚未绑定, `
    }请私信 Bot 好友后使用 "绑定" 指令进行绑定`
  }

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
