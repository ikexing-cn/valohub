import type { Commands } from '.'

interface HelpItem {
  name: Commands
  description: string
  usage?: string
}

export const helpItems: HelpItem[] = [
  {
    name: 'ping',
    description: '检查机器人是否正常运行',
  },
  {
    name: 'help',
    description: '检查帮助信息',
  },
  {
    name: 'bind',
    description: '绑定你的 Valorant 账号',
    usage: '/bind [alias? = "default"]',
  },
  {
    name: 'unbind',
    description: '解绑你的 Valorant 账号',
    usage: '/unbind [alias? = "default"]',
  },
  {
    name: 'dailystore',
    description: '查看每日商店',
    usage: '/dailyStore [alias? = "default"]',
  },
]

export function help(item?: string) {
  if (item) {
    const itemInfo = helpItems.find(
      (i) => i.name.toLowerCase() === item.toLowerCase(),
    )
    if (itemInfo) {
      return (
        itemInfo.description +
        (itemInfo.usage ? `\n\n格式: ${itemInfo.usage}` : '')
      )
    } else {
      return '未找到该指令'
    }
  } else {
    return helpItems.reduce((acc, item) => {
      return `${acc}\n/${item.name} - ${item.description}`
    }, '指令列表:')
  }
}
