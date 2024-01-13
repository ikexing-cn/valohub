import { CQ, type CQWebSocket, type message as Message } from 'go-cqwebsocket'

export function sendMessage({
  senderId: sender,
  messageId,
  client,
}: {
  senderId: number
  client: CQWebSocket
  messageId: number
}) {
  return (isGroup: boolean, message: Message) => {
    const msg = typeof message === 'string' ? [CQ.text(message)] : message
    if (isGroup) {
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
