/* eslint-disable no-console */
import { findCommandBase, parseCommand } from './commands'
import { sendMessage } from './utils/chat'
import { helpCommand } from './commands/help'
import { bindCommand } from './commands/bind'

import { dailyStoreCommand } from './commands/daily-store'
import { unbindCommand } from './commands/unbind'
import { verifyCommand } from './commands/verify'
import type { Page } from 'puppeteer'
import type { Tag } from 'go-cqwebsocket/out/tags'
import type { CQEvent, CQWebSocket } from 'go-cqwebsocket'

async function handleMessage(
  client: CQWebSocket,
  page: Page,
  event: CQEvent<'message'>,
) {
  const context = event.context
  const message = context.message
  const isGroup = context.message_type === 'group'

  if (
    isGroup &&
    (typeof message === 'string' ||
      !message.some(
        (item) => item.type === 'at' && item.data.qq === '149384916',
      ))
  )
    return

  const textMessage = (message as Tag[])?.find((item) => item.type === 'text')
    ?.data?.text as string
  if (!textMessage) return

  const { command, args } = parseCommand(textMessage.trim())
  const commandBase = findCommandBase(isGroup, command)

  const send = sendMessage({
    client,
    isGroup,
    messageId: context.message_id,
    senderId: isGroup ? context.group_id : context.user_id,
  })

  if (isGroup) {
    const friendList = await client.get_friend_list()
    if (
      !friendList.some((friend) => friend.user_id === context.sender.user_id)
    ) {
      send('避免腾讯风控，请先添加 Bot 好友才可以正常使用 「申请会自动通过」')
      return
    }
  }

  const senderUserId = context.sender.user_id

  switch (commandBase) {
    case 'ping':
      send('pong')
      break
    case 'help':
      send(helpCommand(args?.[0]))
      break
    case 'dailystore':
      send(await dailyStoreCommand(page, senderUserId, args?.[0]))
      break
    case 'bind':
      send(bindCommand(senderUserId, args?.[0]))
      break
    case 'unbind':
      send(await unbindCommand(senderUserId, args?.[0]))
      break
    case 'verify':
      if (!args || args?.length < 1) return send('此命令至少需要一个参数')
      send(await verifyCommand(senderUserId, args[0], args?.[1]))
      break
    default:
      send('未知指令')
      break
  }
}

export function registerEvent(client: CQWebSocket, page: Page) {
  client.on('request.friend', (event) => {
    setTimeout(() => {
      client.set_friend_add_request(
        event.context.flag,
        true,
        '[自动添加] ValorantBot',
      )
    }, Math.random() * 2000)
  })

  client.on('message', (event) => handleMessage(client, page, event))
}
