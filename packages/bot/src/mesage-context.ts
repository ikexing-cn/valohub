interface MessageContext {
  type: 'bind'
  step: number
  stepData: string[]
}

export const praviteContext: Map<number, MessageContext> = new Map()

export function createMessageContext(qq: number, type: 'bind') {
  const context: MessageContext = {
    type,
    step: -1,
    stepData: [],
  }
  praviteContext.set(qq, context)
  return context
}

export function getMessageContext(qq: number) {
  return praviteContext.get(qq)
}

export function clearMessageContext(qq: number) {
  praviteContext.delete(qq)
}
