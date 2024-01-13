export const commands = {
  pravite: {
    bind: {
      aliases: ['bind', '绑定'],
      desc: '绑定 riot 账号 「仅限私聊」',
      usage: '绑定 <别名 = default>',
    },
    unbind: {
      aliases: ['unbind', '解绑'],
      desc: '解绑 riot 账号 「仅限私聊」',
      usage: '解绑 <别名 = default>',
    },
    verify: {
      aliases: ['verify', '验证'],
      desc: '账户所有权验证 「仅限私聊」',
      usage: '验证 <密码> <别名 = default>',
    },
  },
  common: {
    ping: {
      aliases: ['p', 'ping'],
      desc: '测试 bot 存活',
      usage: 'ping',
    },
    help: {
      aliases: ['h', 'help', '帮助'],
      desc: '查看命令帮助',
      usage: '帮助 <命令名>',
    },
    dailystore: {
      aliases: ['dailystore', '每日商店'],
      desc: '查看每日商店',
      usage: '每日商店 <别名 = default>',
    },
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
    for (const [name, cmdOptions] of Object.entries(config)) {
      if (cmdOptions.aliases.includes(command.toLowerCase())) {
        if (isGroup && group === 'pravite') {
          return null
        }
        return name as AllCommandKeys
      }
    }
  }

  return null
}
