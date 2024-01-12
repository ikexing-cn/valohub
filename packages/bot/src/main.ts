/* eslint-disable no-console */
import 'dotenv/config'
import * as puppeteer from 'puppeteer'

import { CQWebSocket } from 'go-cqwebsocket'
import { registerEvent } from './event'
// eslint-disable-next-line sort-imports

export const client = new CQWebSocket({
  host: process.env.VALORANT_BOT_HOST || 'localhost',
  port: Number(process.env.VALORANT_BOT_PORT) || 3000,
})
client.connect()

registerEvent(client)

const browser = await puppeteer.launch({ headless: 'new' })
const page = await browser.newPage()

process.on('beforeExit', async () => {
  await page.close()
  await browser.close()
  client.disconnect()
})
