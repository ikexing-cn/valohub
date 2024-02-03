import { commands } from './index'

export function helpCommand(command?: string): string {
  if (!command) {
    return Object.values(commands)
      .flatMap(item => Object.entries(item))
      .reduce((acc, [key, value]) => `${key}: ${value.desc}\n${acc}`, '')
  }
  else {
    const foundCommand = Object.values(commands)
      .flatMap(item => Object.entries(item))
      .find(([, value]) => value.aliases.includes(command))
    if (foundCommand) {
      const [, value] = foundCommand
      return `${command}: \n-介绍: ${value.desc}\n-别名: [${value.aliases.join(', ')}]\n-使用方法: ${value.usage}`
    }
    return `未知命令： ${command}`
  }
}
