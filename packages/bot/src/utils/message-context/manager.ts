import { BindMessageContext } from '../../command/bind'
import { MessageContext } from '.'
import type { Commands } from '../../command'

export const messageContextMap: Map<number, MessageContext<any>> = new Map()

export function createMsgCtx(qq: number, type: Commands) {
  if (messageContextMap.has(qq)) {
    clearMsgCtx(qq)
  }

  let context: MessageContext<typeof type>
  switch (type) {
    case 'bind':
      context = new BindMessageContext(qq)
      break
    default:
      context = new MessageContext(qq, type)
  }

  messageContextMap.set(qq, context)
  return context
}

export function getMsgCtx(qq: number) {
  return messageContextMap.get(qq)
}

export function clearMsgCtx(qq: number) {
  messageContextMap.delete(qq)
}
