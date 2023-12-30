/* eslint-disable no-console */

import { CQ, type CQEvent, CQWebSocket } from 'go-cqwebsocket'
import 'dotenv/config'
import { request } from './utils/request'
import { parseCommand } from './command'
import {
  clearMessageContext,
  createMessageContext,
  getMessageContext,
} from './mesage-context'
import type {
  AccountBindResponse,
  InGameStoreFrontResponse,
} from '@valorant-bot/shared'

const commands = ['help', 'bind', 'dailystore']

const client = new CQWebSocket({
  host: process.env.VALORANT_BOT_HOST || 'localhost',
  port: Number(process.env.VALORANT_BOT_PORT) || 3000,
})

type GroupContext = CQEvent<'message.group'>['context']
export function groupReply(context: GroupContext, message: string) {
  return client.send_msg({
    group_id: context.group_id,
    message: [CQ.reply(context.message_id), CQ.text(message)],
    message_type: 'group',
    auto_escape: false,
  })
}

export function sendPravite(qq: number, message: string) {
  return client.send_private_msg(qq, message, true)
}

async function handleCommandDailystore(context: GroupContext) {
  const response = await request<InGameStoreFrontResponse>(
    '/in-game/store-front',
    context.user_id,
  )
  if (response.success) {
    groupReply(context, response.data.skinItems!.join('\n'))
  }
}

function handleCommandBind(context: GroupContext) {
  groupReply(context, '此命令需要绑定 Riot 账号，请查询私聊')
  sendPravite(context.user_id, '请输入你需要绑定的 Riot 账号')
  createMessageContext(context.user_id, 'bind')
}

client.on('message.group', (event) => {
  const context = event.context
  const message = context.raw_message
  console.log(222)
  if (context.group_id !== 833851946 || !message.startsWith('/')) return

  const command = parseCommand(message)
  if (!command) return

  if (!commands.includes(command)) {
    return groupReply(context, '未知指令')
  }

  switch (command) {
    case 'help':
      return groupReply(context, '帮助')
    case 'bind':
      return handleCommandBind(context)
    case 'dailystore':
      return handleCommandDailystore(context)
    default:
      return groupReply(context, '未知指令')
  }
})

client.on('message.private', async (event) => {
  const context = event.context
  const msgCtx = getMessageContext(context.user_id)
  if (msgCtx == null)
    return sendPravite(context.user_id, '无效的上下文对话，请输入指令')

  if (msgCtx.type === 'bind') {
    switch (msgCtx.step) {
      case -1: {
        msgCtx.step = 0
        msgCtx.stepData.push(context.raw_message)
        sendPravite(context.user_id, '请输入你需要绑定的 Riot 密码')
        break
      }
      case 0: {
        const resposne = await request<AccountBindResponse>(
          '/account/bind',
          context.user_id,
          {
            body: {
              username: msgCtx.stepData[0],
              password: context.raw_message,
            },
          },
        )
        if (resposne.success) {
          clearMessageContext(context.user_id)
          sendPravite(context.user_id, resposne.message)
          return
        }

        if (resposne.data?.needMFA) {
          msgCtx.step = 1
          msgCtx.stepData.push(context.raw_message)
          sendPravite(context.user_id, resposne.message)
        } else {
          sendPravite(context.user_id, resposne.message)
        }

        console.log(resposne)
        break
      }
      case 1: {
        const resposne = await request<AccountBindResponse>(
          '/account/bind',
          context.user_id,
          {
            body: {
              username: msgCtx.stepData[0],
              password: msgCtx.stepData[1],
              mfaCode: Number(context.raw_message),
            },
          },
        )
        console.log(resposne)

        if (resposne.success) {
          clearMessageContext(context.user_id)
          sendPravite(context.user_id, resposne.message!)
          return
        } else {
          sendPravite(context.user_id, resposne.message!)
          return
        }
      }
    }
  }
})

client.connect()
console.log('success opened')
