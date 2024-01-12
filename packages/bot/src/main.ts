/* eslint-disable no-console */
import 'dotenv/config'
import * as puppeteer from 'puppeteer'

import { CQWebSocket } from 'go-cqwebsocket'
import {
  executeCommandWithGroup,
  executeCommandWithPravite,
  parseCommand,
} from './command'
import { groupReply, sendPravite } from './utils/chat'
import { getMsgCtx } from './utils/message-context/manager'
// eslint-disable-next-line sort-imports

export const client = new CQWebSocket({
  host: process.env.VALORANT_BOT_HOST || 'localhost',
  port: Number(process.env.VALORANT_BOT_PORT) || 3000,
})

function verifyCommand(message: string) {
  const command = parseCommand(message)
  if (!command) {
    return '未知指令！'
  }
  const [name, ...args] = command

  return [name, ...args] as const
}

client.on('message.group', async (event) => {
  const context = event.context
  const message = context.raw_message
  if (context.group_id !== 833851946 || !message.startsWith('/')) return

  const verifyCmdResult = verifyCommand(message)
  if (typeof verifyCmdResult === 'string') {
    return groupReply(context, verifyCmdResult)
  }
  const [command, ...args] = verifyCmdResult

  const result = await executeCommandWithGroup({
    args,
    command,
    sender: context.user_id,
    replyGroupMsg: (msg: string) => {
      groupReply(context, msg)
    },
    sendPraviteMsg: (msg: string) => {
      sendPravite(context.user_id, msg)
    },
  })

  result && groupReply(context, result)
})

client.on('message.private', async (event) => {
  const context = event.context
  const message = context.raw_message
  if (message.startsWith('/')) {
    const verifyCmdResult = verifyCommand(message)
    if (typeof verifyCmdResult === 'string') {
      return sendPravite(context.user_id, verifyCmdResult)
    }
    const [command, ...args] = verifyCmdResult

    const result = await executeCommandWithPravite({
      args,
      command,
      message: '',
      isCommand: true,
      sender: context.user_id,
      sendPraviteMsg: (msg: string) => {
        sendPravite(context.user_id, msg)
      },
    })

    result && sendPravite(context.user_id, result)
  } else {
    const msgCtx = getMsgCtx(context.user_id)
    if (msgCtx == null)
      return sendPravite(context.user_id, '无效的上下文对话，请先输入指令！')

    const result = await executeCommandWithPravite({
      message,
      args: [],
      isCommand: false,
      command: msgCtx.type,
      sender: context.user_id,
      sendPraviteMsg: (msg: string) => {
        sendPravite(context.user_id, msg)
      },
    })

    result && sendPravite(context.user_id, result)
  }
})

client.connect()

const browser = await puppeteer.launch({ headless: 'new' })
const page = await browser.newPage()

export async function getScreenShot(qq: string, alias: string) {
  await page.goto(
    `${
      process.env.VALORANT_WEBSITE_URL ?? 'http://localhost:5173'
    }/daily-store?qq=${qq}&alias=${alias}`,
    {
      waitUntil: 'networkidle2',
    },
  )

  await page.screenshot({
    path: 'screenshot.png',
    type: 'png',
    clip: {
      x: 0,
      y: 0,
      height: 370,
      width: 700,
    },
  })

  // return import.meta.resolve('../screenshot.png')
  return 'files:///c:/screenshot.png'
}

console.log('Success opened for CQWebSocket.')
