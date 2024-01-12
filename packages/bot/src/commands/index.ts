export const commands = {
  pravite: {
    bind: ['bind', '绑定'],
    unbind: ['unbind', '解绑', '取消绑定'],
  },
  common: {
    ping: ['ping'],
    help: ['help', '帮助'],
    dailystore: ['dailystore', '每日商店'],
  },
}

type CommandGroups = keyof typeof commands
type CommandKeys<Group extends CommandGroups> = keyof (typeof commands)[Group]

export type AllCommandKeys = {
  [Group in CommandGroups]: CommandKeys<Group>
}[CommandGroups]

// eg: 绑定 123456789
export function parseCommand(command: string) {
  if (command.includes(' ')) {
    const nameWithArgs = command.split(' ')
    return {
      command: nameWithArgs[0],
      args: nameWithArgs.slice(1),
    }
  } else {
    return {
      command,
    }
  }
}

export function findCommandBase(isGroup: boolean, command: string) {
  for (const [group, config] of Object.entries(commands)) {
    for (const [name, aliases] of Object.entries(config)) {
      if (aliases.includes(command.toLowerCase())) {
        if (isGroup && group === 'pravite') {
          return null
        }
        return name as AllCommandKeys
      }
    }
  }

  return null
}
