/* eslint-disable no-return-await */
import {
  clearMsgCtx,
  createMsgCtx,
  getMsgCtx,
} from '../utils/message-context/manager'
import { bind } from './bind'
import { dailyStore } from './daily-store'
import { help, helpItems } from './help'
import { unbind } from './unbind'

export type Commands =
  | 'ping'
  | 'help'
  | 'bind'
  | 'unbind'
  | 'dailystore'
  | 'clear'
  | 'error'

export interface ExecuteCommandGroupOptions {
  args: string[]
  sender: number
  command: Commands
  replyGroupMsg: (msg: string) => void
  sendPraviteMsg: (msg: string) => void
}

export interface ExecuteCommandPraviteOptions {
  isCommand: boolean
  args: string[]
  message: string
  sender: number
  command: Commands
  sendPraviteMsg: (msg: string) => void
}

export function parseCommand(str: string) {
  if (!str.startsWith('/')) return false
  const [name, ...params] = str.replace('/', '').toLowerCase().split(' ')
  if (helpItems.map((item) => item.name.toLowerCase()).includes(name)) {
    return [name as Commands, ...params] as const
  } else {
    return false
  }
}

export function executeCommandWithGroup(options: ExecuteCommandGroupOptions) {
  switch (options.command) {
    case 'ping':
      return 'pong!'
    case 'help':
      return help(...options.args)
    case 'bind':
      return bind(options)
    case 'unbind':
      return unbind(options.sender)
    case 'dailystore':
      return dailyStore(options.sender)
    case 'clear':
      clearMsgCtx(options.sender)
      return '已清除消息上下文'
    default:
      return '未知指令'
  }
}

export async function executeCommandWithPravite(
  options: ExecuteCommandPraviteOptions,
) {
  switch (options.command) {
    case 'ping':
      return 'pong!'
    case 'help':
      return help(...options.args)
    case 'bind':
      return options.isCommand
        ? createMsgCtx(options.sender, 'bind').execute()
        : await getMsgCtx(options.sender)?.execute(
            options.message,
            options.sendPraviteMsg,
          )
    case 'unbind':
      return unbind(options.sender)
    case 'dailystore':
      return dailyStore(options.sender)
    case 'error': {
      const msgCtx = getMsgCtx(options.sender)!
      await msgCtx.execute(options.message, options.sendPraviteMsg)
      clearMsgCtx(options.sender)
      return
    }
    case 'clear':
      clearMsgCtx(options.sender)
      return '已清除消息上下文'
    default:
      return '未知指令'
  }
}
