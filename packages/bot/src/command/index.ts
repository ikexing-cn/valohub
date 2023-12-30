/* eslint-disable no-return-await */
import { bind, bindWithCtx, bindWithCtxStart } from './bind'
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
      return 'dailystore'
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
        ? bindWithCtxStart(options.sender, options.args[0])
        : await bindWithCtx(options)
    case 'unbind':
      return 'unbind'
    case 'dailystore':
      return 'dailystore'
    default:
      return 'unknown command'
  }
}
