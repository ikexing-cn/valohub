/* eslint-disable no-console */
import { findCommandBase, parseCommand } from './commands'
import { sendMessage } from './utils/chat'
import type { Tag } from 'go-cqwebsocket/out/tags'
import type { CQWebSocket } from 'go-cqwebsocket'

export function registerEvent(client: CQWebSocket) {
  client.on('request.friend', (event) => {
    setTimeout(() => {
      client.set_friend_add_request(
        event.context.flag,
        true,
        '[自动添加] ValorantBot',
      )
    }, Math.random() * 2000)
  })

  client.on('message', (event) => {
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

    switch (commandBase) {
      case 'ping':
        send('pong')
        break
      case 'help':
        send('todo')
        break
      case 'dailystore':
        send('todo')
        break
      case 'bind':
        send('todo')
        break
      case 'unbind':
        send('todo')
        break
      default:
        send('未知指令')
        break
    }
  })

  client.on('socket.open', () => {
    console.log('Success opened for CQWebSocket.')
  })

  client.on('socket.close', () => client.connect())
}
