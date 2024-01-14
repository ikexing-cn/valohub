/* eslint-disable no-console */
import 'dotenv/config'

import { CQWebSocket } from 'go-cqwebsocket'
import { registerEvent } from './event'
import { ScreenshotQueue } from './utils/screenshot-queue'
// eslint-disable-next-line sort-imports

export const client = new CQWebSocket({
  host: process.env.VALORANT_BOT_HOST || 'localhost',
  port: Number(process.env.VALORANT_BOT_PORT) || 8080,
})
client.connect()

const screenshotQueue = new ScreenshotQueue(
  Number(process.env.VALORANT_BOT_SCREENSHOT_QUEUE_SIZE) || 3,
)

registerEvent(client, screenshotQueue)

console.log('Bot started')

process.on('beforeExit', async () => {
  await screenshotQueue.beforceExit()
  client.disconnect()
})
