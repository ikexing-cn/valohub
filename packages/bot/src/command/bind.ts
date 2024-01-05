import { MessageContext } from '../utils/message-context'
import { clearMsgCtx, createMsgCtx } from '../utils/message-context/manager'
import type { RequestFunction } from '../utils/request'
import type {
  AccountBindResponse,
  AccountBindSchema,
} from '@valorant-bot/shared'

import type { ExecuteCommandGroupOptions } from '.'

export async function bind(options: ExecuteCommandGroupOptions) {
  options.replyGroupMsg(
    `此命令需要完整的验证你的 Riot 账号，请查阅私聊信息进行绑定`,
  )
  options.sendPraviteMsg(await createMsgCtx(options.sender, 'bind').execute())
}

export class BindMessageContext extends MessageContext<'bind'> {
  constructor(qq: number) {
    super(qq, 'bind')
  }

  async execute(message?: string, sendMsg?: (msg: string) => void) {
    if (message == null || sendMsg == null) {
      return '请输入你需要绑定的 Riot 账号'
    }

    await super.execute(message, sendMsg)

    switch (this.step) {
      case 0: {
        this.forward(message)
        return '请输入你需要绑定的 Riot 密码'
      }
      case 1: {
        const [isSuccess, resMeg, needMFA] = await sendFetch(
          this.request,
          ...this.stepData,
          message,
        )
        if (needMFA) {
          this.forward(message)
        }
        if (isSuccess) {
          clearMsgCtx(this.qq)
        }
        return resMeg
      }
      case 2: {
        const [isSuccess, resMeg] = await sendFetch(
          this.request,
          ...this.stepData,
          message,
        )
        if (isSuccess) {
          clearMsgCtx(this.qq)
        }
        return resMeg
      }
      default: {
        return '出现未知错误，请联系开发者'
      }
    }
  }
}

async function sendFetch(
  request: RequestFunction,
  ...messages: string[]
): Promise<[boolean, string, boolean?]> {
  const body: AccountBindSchema = {
    remember: true,
    alias: messages[0],
    username: messages[1],
    password: messages[2],
    mfaCode: messages?.[3] ?? undefined,
  }

  const response = await request<AccountBindSchema, AccountBindResponse>(
    '/account/bind',
    { body },
  )

  if (!response.success && response?.data?.needMFA) {
    return [response.success, response.message, true]
  }

  return [response.success, response.message]
}
