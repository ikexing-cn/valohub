import { BindMessageContext } from '../../command/bind'
import type { MessageContext } from '.'

export const messageContextMap: Map<number, MessageContext<any>> = new Map()

export function createMsgCtx(qq: number, type: 'bind') {
  if (messageContextMap.has(qq)) {
    clearMsgCtx(qq)
  }

  let context: MessageContext<typeof type>
  switch (type) {
    case 'bind':
      context = new BindMessageContext(qq)
      break
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
