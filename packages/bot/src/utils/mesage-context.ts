import type { Commands } from '../command'

export interface MessageContext {
  step: number
  type: Commands
  stepData: string[]
}

export const messageContextMap: Map<number, MessageContext> = new Map()

export function createMsgCtx(qq: number, type: 'bind') {
  if (messageContextMap.has(qq)) {
    clearMsgCtx(qq)
  }

  const context: MessageContext = {
    type,
    step: -1,
    stepData: [],
  }
  messageContextMap.set(qq, context)
  return context
}

export function forwardMsgCtx(qq: number, stepData: string) {
  const context = getMsgCtx(qq)
  if (context) {
    context.step += 1
    context.stepData.push(stepData)
  }
}

export function backMsgCtx(qq: number) {
  const context = getMsgCtx(qq)
  if (context) {
    context.step -= 1
    context.stepData.pop()
  }
}

export function getMsgCtx(qq: number) {
  return messageContextMap.get(qq)
}

export function clearMsgCtx(qq: number) {
  messageContextMap.delete(qq)
}
