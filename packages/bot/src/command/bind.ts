import {
  type MessageContext,
  clearMsgCtx,
  createMsgCtx,
  forwardMsgCtx,
  getMsgCtx,
} from '../utils/mesage-context'
import { createRequest } from '../utils/request'
import type { message } from 'go-cqwebsocket'
import type { ExecuteCommandPraviteOptions } from './index'
import type {
  AccountBindResponse,
  AccountBindSchema,
} from '@valorant-bot/shared'
import type { ExecuteCommandGroupOptions } from '.'

export function bind(options: ExecuteCommandGroupOptions) {
  options.replyGroupMsg(
    `此命令需要完整的验证你的 Riot 账号，请查阅私聊信息进行绑定`,
  )
  options.sendPraviteMsg(bindWithCtxStart(options.sender, options.args?.[0]))
}

export function bindWithCtxStart(qq: number, _alias?: string) {
  const alias = _alias || 'default'

  createMsgCtx(qq, 'bind')
  forwardMsgCtx(qq, alias)
  return '请输入你需要绑定的 Riot 账号'
}

export async function bindWithCtx(options: ExecuteCommandPraviteOptions) {
  const msgCtx = getMsgCtx(options.sender)

  if (msgCtx == null) {
    return '无效的上下文对话，请先输入指令！'
  }

  switch (msgCtx.step) {
    case 0: {
      forwardMsgCtx(options.sender, options.message)
      return '请输入你需要绑定的 Riot 密码'
    }
    case 1: {
      const [isSuccess, message] = await sendFetch(
        [msgCtx.stepData[0], msgCtx.stepData[1], options.message],
        [options.sender, options.sendPraviteMsg],
      )
      if (isSuccess) forwardMsgCtx(options.sender, options.message)
      return message
    }
    case 2: {
      const [isSuccess, message] = await sendFetch(
        [
          msgCtx.stepData[0],
          msgCtx.stepData[1],
          msgCtx.stepData[2],
          options.message,
        ],
        [options.sender, options.sendPraviteMsg],
      )

      if (isSuccess) forwardMsgCtx(options.sender, options.message)
      return message
    }
  }
}

async function sendFetch(
  messages: string[],
  config: Parameters<typeof createRequest>,
): Promise<[boolean, message]> {
  const body: AccountBindSchema = {
    remember: true,
    alias: messages[0],
    username: messages[1],
    password: messages[2],
    mfaCode: messages?.[3] ? Number(messages[3]) : undefined,
  }

  const request = createRequest(...config)
  const response = await request<AccountBindSchema, AccountBindResponse>(
    '/account/bind',
    { body },
  )

  if (!response.success) {
    if (response.data?.isBinded) {
      clearMsgCtx(config[0])
      return [response.success, response.message]
    }

    return [response.success, response.message]
  }

  return [response.success, response.message]
}
