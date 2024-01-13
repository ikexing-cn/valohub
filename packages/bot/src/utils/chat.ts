import { CQ, type CQWebSocket, type message as Message } from 'go-cqwebsocket'

export function sendMessage({
  senderId: sender,
  messageId,
  client,
  isGroup,
}: {
  senderId: number
  isGroup: boolean
  client: CQWebSocket
  messageId: number
}) {
  return (message: Message, sendGroup?: boolean) => {
    const msg = typeof message === 'string' ? [CQ.text(message)] : message
    if (sendGroup ?? isGroup) {
      client.send_msg({
        auto_escape: false,
        message_type: 'group',
        group_id: sender,
        message: [CQ.reply(messageId!), ...msg],
      })
    } else {
      client.send_private_msg(sender, msg)
    }
  }
}
