import { CQ } from 'go-cqwebsocket'

export function infoCommand() {
  const toReturnMessages = [
    '此项目由 @ikexing-cn(ikx) 开发, Github: https://github.com/ikexing-cn',
    '项目地址: https://github.com/ikexing-cn/valorant-bot (MIT License)',
    '如果你有任何问题或建议, 欢迎在 Github 提 issue 或 pull request',
    '如果此项目对你有所帮助, 欢迎给我一个 star',
  ]

  return toReturnMessages.map((item) => CQ.text(`${item}\n`))
}
