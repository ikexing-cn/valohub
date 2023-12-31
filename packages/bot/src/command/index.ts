/* eslint-disable no-return-await */
import { createMsgCtx, getMsgCtx } from '../utils/message-context/manager'
import { bind } from './bind'
import { dailyStore } from './daily-store'
import { help, helpItems } from './help'

export type Commands = 'ping' | 'help' | 'bind' | 'unbind' | 'dailystore'

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
      return 'unbind'
    case 'dailystore':
      return dailyStore(options.sender)
    default:
      return 'unknown command'
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
      return 'unbind'
    case 'dailystore':
      return dailyStore(options.sender)
    default:
      return 'unknown command'
  }
}
