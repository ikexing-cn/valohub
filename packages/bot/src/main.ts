/* eslint-disable no-console */
import 'dotenv/config'

import { env, on as processOn } from 'node:process'

import { CQWebSocket } from 'go-cqwebsocket'
import { registerEvent } from './event'
import { ScreenshotQueue } from './utils/screenshot-queue'

export const client = new CQWebSocket({
  host: env.VALORANT_BOT_HOST || 'localhost',
  port: Number(env.VALORANT_BOT_PORT) || 8080,
})
client.connect()

const screenshotQueue = new ScreenshotQueue(
  Number(env.VALORANT_BOT_SCREENSHOT_QUEUE_SIZE) || 3,
)

registerEvent(client, screenshotQueue)

console.log('Bot started')

processOn('beforeExit', async () => {
  await screenshotQueue.beforceExit()
  client.disconnect()
})
