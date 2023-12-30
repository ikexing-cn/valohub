import { CQ, type CQEvent, type message as Message } from 'go-cqwebsocket'

import { client } from '../main'

type GroupContext = CQEvent<'message.group'>['context']
export function groupReply(context: GroupContext, message: Message) {
  const msg = typeof message === 'string' ? [CQ.text(message)] : message

  return client.send_msg({
    auto_escape: false,
    message_type: 'group',
    group_id: context.group_id,
    message: [CQ.reply(context.message_id), ...msg],
  })
}

export function sendPravite(qq: number, message: Message) {
  return client.send_private_msg(qq, message, typeof message === 'string')
}
